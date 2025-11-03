package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.entity.ChargingPoint;
import swp391.fa25.swp391.entity.Reservation;
import swp391.fa25.swp391.repository.ChargingPointRepository;
import swp391.fa25.swp391.repository.ReservationRepository;
import swp391.fa25.swp391.service.IService.IReservationService;

import java.time.LocalDateTime; // ⭐ IMPORT LocalDateTime thay vì Instant
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationService implements IReservationService {

    private final ReservationRepository reservationRepository;
    private final ChargingPointRepository chargingPointRepository;
    private final ChargingStationService chargingStationService; // ⭐ THÊM dependency

    // Status constants
    private static final String STATUS_ACTIVE = "active";
    private static final String STATUS_CANCELLED = "cancelled";
    private static final String STATUS_EXPIRED = "expired";
    private static final String STATUS_FULFILLED = "fulfilled";

    @Override
    @Transactional
    public Reservation register(Reservation reservation) {
        Reservation savedReservation = reservationRepository.save(reservation);
        
        // ⭐ Set Point = BOOKED và cascade update
        if (reservation.getChargingPoint() != null) {
            ChargingPoint point = reservation.getChargingPoint();
            point.setStatus("booked");
            chargingPointRepository.save(point);
            
            // ⭐ Cascade: Point → Station → Facility
            if (point.getStation() != null) {
                chargingStationService.updateStationStatusBasedOnPoints(point.getStation());
            }
            
            log.info("Created reservation {} - Point {} set to BOOKED", 
                    savedReservation.getId(), point.getId());
        }
        
        return savedReservation;
    }

    @Override
    @Transactional
    public void deleteReservation(Integer id) {
        Optional<Reservation> reservationOpt = reservationRepository.findById(Long.valueOf(id));
        
        if (reservationOpt.isPresent()) {
            Reservation reservation = reservationOpt.get();
            
            // ⭐ Giải phóng Point và cascade update
            if (reservation.getChargingPoint() != null) {
                ChargingPoint point = reservation.getChargingPoint();
                point.setStatus("active");
                chargingPointRepository.save(point);
                
                // ⭐ Cascade: Point → Station → Facility
                if (point.getStation() != null) {
                    chargingStationService.updateStationStatusBasedOnPoints(point.getStation());
                }
                
                log.info("Deleted reservation {} - Point {} released", 
                        id, point.getId());
            }
        }
        
        reservationRepository.deleteById(Long.valueOf(id));
    }

    @Override
    public Reservation findById(Integer id) {
        Optional<Reservation> reservation = reservationRepository.findById(Long.valueOf(id));
        return reservation.orElse(null);
    }

    @Override
    public List<Reservation> findAll() {
        return reservationRepository.findAll();
    }

    @Override
    public List<Reservation> findByUserId(Integer userId) {
        // userId được map với driverId trong hệ thống
        return reservationRepository.findByDriver_Id(userId);
    }

    @Override
    public List<Reservation> findByChargingStationId(Integer chargingStationId) {
        return reservationRepository.findByChargingPoint_Station_Id(chargingStationId);
    }

    @Override
    public List<Reservation> findByChargingPointId(Integer chargingPointId) {
        return List.of();
    }

    @Transactional
    public void setReservationStatus(Reservation reservation, String status) {
        if (!isValidStatus(status)) {
            throw new IllegalArgumentException("Invalid reservation status: " + status);
        }

        validateStatusTransition(reservation.getStatus(), status);

        String oldStatus = reservation.getStatus();
        reservation.setStatus(status);
        reservationRepository.save(reservation);
        
        // ⭐ Xử lý Point status khi reservation status thay đổi
        handlePointStatusOnReservationChange(reservation, oldStatus, status);
    }

    private boolean isValidStatus(String status) {
        return STATUS_ACTIVE.equals(status) ||
               STATUS_CANCELLED.equals(status) ||
               STATUS_EXPIRED.equals(status) ||
               STATUS_FULFILLED.equals(status);
    }

    private void validateStatusTransition(String currentStatus, String newStatus) {
        if (STATUS_FULFILLED.equals(currentStatus) || STATUS_EXPIRED.equals(currentStatus)) {
            throw new IllegalStateException("Cannot change status of fulfilled or expired reservation");
        }

        if (STATUS_CANCELLED.equals(currentStatus) && !STATUS_ACTIVE.equals(newStatus)) {
            throw new IllegalStateException("Cancelled reservation can only be reactivated");
        }
    }
    // ⭐ SCHEDULED JOB: Check expired reservations
    @Scheduled(fixedRate = 60000) // Chạy mỗi 1 phút
    @Transactional
    public void checkExpiredReservations() {
        LocalDateTime now = LocalDateTime.now(); // ⭐ Dùng LocalDateTime

        List<Reservation> expiredReservations = reservationRepository
                .findByStatusAndEndTimeBefore(STATUS_ACTIVE, now);

        for (Reservation reservation : expiredReservations) {
            reservation.setStatus(STATUS_EXPIRED);
            reservationRepository.save(reservation);

            ChargingPoint point = reservation.getChargingPoint();
            if (point != null && "booked".equals(point.getStatus())) {
                point.setStatus("active");
                chargingPointRepository.save(point);
                
                if (point.getStation() != null) {
                    chargingStationService.updateStationStatusBasedOnPoints(point.getStation());
                }
                
                log.info("Expired reservation {} - Point {} released", 
                        reservation.getId(), point.getId());
            }
        }
        
        if (!expiredReservations.isEmpty()) {
            log.info("Processed {} expired reservations", expiredReservations.size());
        }
    }

    @Transactional
    public void expireReservation(Reservation reservation) {
        if (STATUS_ACTIVE.equals(reservation.getStatus())) {
            reservation.setStatus(STATUS_EXPIRED);
            reservationRepository.save(reservation);
            
            // ⭐ Giải phóng Point và cascade
            releasePoint(reservation);
        }
    }

    @Transactional
    public void fulfillReservation(Reservation reservation) {
        if (STATUS_ACTIVE.equals(reservation.getStatus())) {
            reservation.setStatus(STATUS_FULFILLED);
            reservationRepository.save(reservation);
            
            // ⭐ Point chuyển từ BOOKED → USING (khi bắt đầu sạc)
            // Không cần giải phóng vì point vẫn đang được sử dụng
            // ChargingSession sẽ xử lý việc chuyển sang USING
        }
    }

    // ⭐ NEW: Xử lý Point status khi Reservation status thay đổi
    private void handlePointStatusOnReservationChange(Reservation reservation, 
                                                       String oldStatus, 
                                                       String newStatus) {
        // Khi CANCEL hoặc EXPIRE → giải phóng Point
        if ((STATUS_CANCELLED.equals(newStatus) || STATUS_EXPIRED.equals(newStatus)) 
            && STATUS_ACTIVE.equals(oldStatus)) {
            releasePoint(reservation);
        }
        
        // Khi REACTIVATE → book lại Point
        if (STATUS_ACTIVE.equals(newStatus) && !STATUS_ACTIVE.equals(oldStatus)) {
            bookPoint(reservation);
        }
    }

    // ⭐ NEW: Giải phóng Point
    private void releasePoint(Reservation reservation) {
        ChargingPoint point = reservation.getChargingPoint();
        if (point != null && "booked".equals(point.getStatus())) {
            point.setStatus("active");
            chargingPointRepository.save(point);
            
            // Cascade update
            if (point.getStation() != null) {
                chargingStationService.updateStationStatusBasedOnPoints(point.getStation());
            }
            
            log.info("Released point {} from reservation {}", 
                    point.getId(), reservation.getId());
        }
    }

    // ⭐ NEW: Book Point
    private void bookPoint(Reservation reservation) {
        ChargingPoint point = reservation.getChargingPoint();
        if (point != null && "active".equals(point.getStatus())) {
            point.setStatus("booked");
            chargingPointRepository.save(point);
            
            // Cascade update
            if (point.getStation() != null) {
                chargingStationService.updateStationStatusBasedOnPoints(point.getStation());
            }
            
            log.info("Booked point {} for reservation {}", 
                    point.getId(), reservation.getId());
        }
    }
}