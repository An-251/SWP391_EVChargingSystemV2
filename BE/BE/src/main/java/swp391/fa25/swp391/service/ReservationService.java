package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.entity.Charger;
import swp391.fa25.swp391.entity.ChargingPoint;
import swp391.fa25.swp391.entity.Reservation;
import swp391.fa25.swp391.repository.ChargerRepository;
import swp391.fa25.swp391.repository.ChargingPointRepository;
import swp391.fa25.swp391.repository.ReservationRepository;
import swp391.fa25.swp391.service.IService.IReservationService;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationService implements IReservationService {

    private final ReservationRepository reservationRepository;
    private final ChargingPointRepository chargingPointRepository;
    private final ChargerRepository chargerRepository; // ⭐ NEW

    // Reservation Status Constants
    private static final String STATUS_ACTIVE = "active";         // Đã đặt chỗ (point = booked)
    private static final String STATUS_FULFILLED = "fulfilled";   // Đã quét QR, đang sạc (point = using)
    private static final String STATUS_CANCELLED = "cancelled";   // User hủy
    private static final String STATUS_EXPIRED = "expired";       // Hết giờ chưa sử dụng

    // ChargingPoint Status Constants
    private static final String POINT_STATUS_ACTIVE = "active";
    private static final String POINT_STATUS_BOOKED = "booked";
    private static final String POINT_STATUS_USING = "using";

    // ==================== CRUD Operations ====================

    @Transactional
    public Reservation createReservation(Reservation reservation) {
        ChargingPoint chargingPoint = reservation.getChargingPoint();
        Charger charger = reservation.getCharger();
        
        // ⭐ NEW: Validate charger if provided
        if (charger != null) {
            // Kiểm tra charger có available không
            if (!"active".equalsIgnoreCase(charger.getStatus())) {
                throw new RuntimeException("Charger is not available for reservation");
            }
            
            // Kiểm tra charger thuộc charging point này
            if (!charger.getChargingPoint().getId().equals(chargingPoint.getId())) {
                throw new RuntimeException("Charger does not belong to this charging point");
            }
        } else {
            // Backward compatibility: Kiểm tra charging point có available không
            if (!POINT_STATUS_ACTIVE.equals(chargingPoint.getStatus())) {
                throw new RuntimeException("Charging point is not available");
            }
        }
        
        // Set start_time = NOW, end_time = start_time + duration
        LocalDateTime now = LocalDateTime.now();
        reservation.setStartTime(now);
        // end_time được set từ request (ví dụ: now + 1 hour)
        
        // Kiểm tra trùng lịch
        List<Reservation> existingReservations = reservationRepository
                .findByChargingPointIdAndStatusNot(chargingPoint.getId(), STATUS_CANCELLED);

        for (Reservation existing : existingReservations) {
            // Chỉ kiểm tra những reservation chưa expired/fulfilled
            if ((STATUS_ACTIVE.equals(existing.getStatus())) &&
                isTimeOverlap(reservation.getStartTime(), reservation.getEndTime(),
                              existing.getStartTime(), existing.getEndTime())) {
                throw new RuntimeException("Charging point is already reserved for this time slot");
            }
        }

        // Lưu reservation với status ACTIVE ngay lập tức
        reservation.setStatus(STATUS_ACTIVE);
        Reservation savedReservation = reservationRepository.save(reservation);
        
        // ⭐ NEW: Đánh dấu charger là BOOKED (nếu có)
        if (charger != null) {
            reserveCharger(charger);
        }
        
        // Đánh dấu charging point là BOOKED
        reserveChargingPointOnly(chargingPoint);
        
        log.info("Created reservation {} with status ACTIVE for driver {}, valid until {}", 
                savedReservation.getId(), 
                savedReservation.getDriver().getId(),
                savedReservation.getEndTime());
        
        // ⭐ FIX: Refresh entity để lấy ChargingPoint đã updated (tránh detached entity)
        return reservationRepository.findById(savedReservation.getId())
                .orElse(savedReservation);
    }

    @Override
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void processReservations() {
        processExpiredReservations();
    }

    @Override
    @Transactional
    public Reservation register(Reservation reservation) {
        return createReservation(reservation);
    }

    @Override
    @Transactional(readOnly = true)
    public Reservation findById(Integer id) {
        return reservationRepository.findById(Long.valueOf(id))
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Reservation findById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Reservation> findAll() {
        return reservationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Reservation findById(int id) {
        return findById(Long.valueOf(id));
    }

    @Transactional(readOnly = true)
    public List<Reservation> getReservationsByDriver(Long driverId) {
        return reservationRepository.findByDriverId(driverId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Reservation> findByChargingPointId(Integer chargingPointId) {
        return reservationRepository.findByChargingPointId(chargingPointId);
    }

    @Transactional
    public Reservation cancelReservation(Long reservationId, Long driverId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (!reservation.getDriver().getId().equals(driverId)) {
            throw new RuntimeException("You are not authorized to cancel this reservation");
        }

        // Chỉ có thể cancel nếu đang ở trạng thái ACTIVE
        if (!STATUS_ACTIVE.equals(reservation.getStatus())) {
            throw new RuntimeException("Can only cancel active reservations. Current status: " + reservation.getStatus());
        }
        
        // Cập nhật status thành CANCELLED
        reservation.setStatus(STATUS_CANCELLED);
        Reservation savedReservation = reservationRepository.save(reservation);
        
        // ⭐ NEW: Nhả charger về ACTIVE (nếu có)
        if (reservation.getCharger() != null) {
            releaseCharger(reservation.getCharger());
        }
        
        // Nhả charging point về ACTIVE
        releaseChargingPointOnly(reservation.getChargingPoint());
        
        log.info("Cancelled reservation {}", reservationId);
        return savedReservation;
    }

    /**
     * Được gọi từ ChargingSessionService khi user quét QR và bắt đầu sạc
     */
    @Transactional
    public void fulfillReservation(Long reservationId) {
        Reservation reservation = findById(reservationId);
        
        // Kiểm tra status phải là ACTIVE
        if (!STATUS_ACTIVE.equals(reservation.getStatus())) {
            throw new RuntimeException("Reservation must be active to fulfill. Current status: " + reservation.getStatus());
        }
        
        // Kiểm tra chưa hết hạn
        if (LocalDateTime.now().isAfter(reservation.getEndTime())) {
            throw new RuntimeException("Reservation has expired");
        }
        
        // Cập nhật thành FULFILLED
        reservation.setStatus(STATUS_FULFILLED);
        reservationRepository.save(reservation);
        
        log.info("Fulfilled reservation {} - User started charging session", reservationId);
    }

    // ==================== Scheduled Tasks ====================

    /**
     * Chạy mỗi 1 phút để kiểm tra reservations đã hết hạn
     */
    @Transactional
    public void processExpiredReservations() {
        LocalDateTime now = LocalDateTime.now();
        
        log.debug("Checking for expired reservations at {}", now);
        
        // Tìm reservations ACTIVE đã hết hạn (end_time < now)
        List<Reservation> expiredReservations = reservationRepository
                .findExpiredReservations(now, List.of(STATUS_ACTIVE));
        
        if (expiredReservations.isEmpty()) {
            return;
        }
        
        log.info("Found {} expired reservations", expiredReservations.size());
        
        for (Reservation reservation : expiredReservations) {
            try {
                log.info("Processing expired reservation ID: {}, EndTime: {}", 
                        reservation.getId(), 
                        reservation.getEndTime());
                
                // Cập nhật status thành EXPIRED
                reservation.setStatus(STATUS_EXPIRED);
                reservationRepository.save(reservation);
                
                // ⭐ NEW: Nhả charger về ACTIVE (nếu có)
                if (reservation.getCharger() != null) {
                    releaseCharger(reservation.getCharger());
                }
                
                // Nhả charging point về ACTIVE
                ChargingPoint chargingPoint = reservation.getChargingPoint();
                if (chargingPoint != null) {
                    releaseChargingPointOnly(chargingPoint);
                }
                
                log.info("Successfully expired reservation {}", reservation.getId());
                        
            } catch (Exception e) {
                log.error("Error processing expired reservation {}: {}",
                        reservation.getId(), e.getMessage(), e);
            }
        }
    }

    // ==================== Helper Methods ====================

    /**
     * ⭐ NEW: Đánh dấu Charger thành BOOKED (khi tạo reservation ACTIVE)
     */
    private void reserveCharger(Charger charger) {
        if (charger == null) return;
        
        charger.setStatus("booked");
        chargerRepository.save(charger);
        log.info("Set Charger {} to booked", charger.getId());
    }
    
    /**
     * ⭐ NEW: Nhả Charger về ACTIVE (khi reservation EXPIRED/CANCELLED)
     */
    private void releaseCharger(Charger charger) {
        if (charger == null) return;
        
        log.info("Releasing Charger {}, current status: {}", charger.getId(), charger.getStatus());
        
        // Chỉ nhả về ACTIVE nếu đang ở trạng thái BOOKED
        if ("booked".equalsIgnoreCase(charger.getStatus())) {
            charger.setStatus("active");
            chargerRepository.save(charger);
            log.info("Released Charger {} to active", charger.getId());
        }
    }

    /**
     * Đánh dấu ChargingPoint thành BOOKED (khi tạo reservation ACTIVE)
     */
    private void reserveChargingPointOnly(ChargingPoint chargingPoint) {
        if (chargingPoint == null) return;
        
        chargingPoint.setStatus(POINT_STATUS_BOOKED);
        chargingPointRepository.save(chargingPoint);
        log.info("Set ChargingPoint {} to {}", chargingPoint.getId(), POINT_STATUS_BOOKED);
    }

    /**
     * Nhả ChargingPoint về ACTIVE (khi reservation EXPIRED/CANCELLED)
     */
    private void releaseChargingPointOnly(ChargingPoint chargingPoint) {
        if (chargingPoint == null) return;
        
        log.info("Releasing ChargingPoint {}, current status: {}",
                chargingPoint.getId(), 
                chargingPoint.getStatus());
        
        // Chỉ nhả về ACTIVE nếu đang ở trạng thái BOOKED
        if (POINT_STATUS_BOOKED.equals(chargingPoint.getStatus())) {
            chargingPoint.setStatus(POINT_STATUS_ACTIVE);
            chargingPointRepository.save(chargingPoint);
            log.info("Released ChargingPoint {} to {}", chargingPoint.getId(), POINT_STATUS_ACTIVE);
        }
    }

    private boolean isTimeOverlap(LocalDateTime start1, LocalDateTime end1,
                                   LocalDateTime start2, LocalDateTime end2) {
        return start1.isBefore(end2) && start2.isBefore(end1);
    }
}