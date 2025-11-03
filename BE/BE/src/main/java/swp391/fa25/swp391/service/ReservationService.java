package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.entity.ChargingPoint;
import swp391.fa25.swp391.entity.ChargingStation;
import swp391.fa25.swp391.entity.Facility;
import swp391.fa25.swp391.entity.Reservation;
import swp391.fa25.swp391.repository.ChargingPointRepository;
import swp391.fa25.swp391.repository.ChargingStationRepository;
import swp391.fa25.swp391.repository.FacilityRepository;
import swp391.fa25.swp391.repository.ReservationRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ChargingPointRepository chargingPointRepository;
    private final ChargingStationRepository chargingStationRepository;
    private final FacilityRepository facilityRepository;

    // ==================== CRUD Operations ====================

    @Transactional
    public Reservation createReservation(Reservation reservation) {
        ChargingPoint chargingPoint = reservation.getChargingPoint();
        
        // Kiểm tra charging point có available không
        if (!"ACTIVE".equals(chargingPoint.getStatus())) {
            throw new RuntimeException("Charging point is not available");
        }
        
        // Kiểm tra trùng lịch
        List<Reservation> existingReservations = reservationRepository
                .findByChargingPointIdAndStatusNot(chargingPoint.getId(), "CANCELLED");

        for (Reservation existing : existingReservations) {
            if (!"EXPIRED".equals(existing.getStatus()) && 
                isTimeOverlap(reservation.getStartTime(), reservation.getEndTime(),
                              existing.getStartTime(), existing.getEndTime())) {
                throw new RuntimeException("Charging point is already reserved for this time slot");
            }
        }

        // Lưu reservation với status PENDING
        reservation.setStatus("PENDING");
        Reservation savedReservation = reservationRepository.save(reservation);
        
        log.info("✅ Created reservation {} for driver {}", 
                savedReservation.getId(), 
                savedReservation.getDriver().getId());
        
        return savedReservation;
    }

    // ⭐ Thêm 2 overload methods
    public Reservation findById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + id));
    }

    public Reservation findById(int id) {
        return findById(Long.valueOf(id));
    }

    public List<Reservation> getReservationsByDriver(Long driverId) {
        return reservationRepository.findByDriverId(driverId);
    }

    @Transactional
    public Reservation cancelReservation(Long reservationId, Long driverId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (!reservation.getDriver().getId().equals(driverId)) {
            throw new RuntimeException("You are not authorized to cancel this reservation");
        }

        if ("CANCELLED".equals(reservation.getStatus()) || "EXPIRED".equals(reservation.getStatus())) {
            throw new RuntimeException("Reservation is already " + reservation.getStatus().toLowerCase());
        }

        // Lưu status cũ
        String oldStatus = reservation.getStatus();
        
        // Cập nhật status thành CANCELLED
        reservation.setStatus("CANCELLED");
        Reservation savedReservation = reservationRepository.save(reservation);
        
        // Nếu reservation đã CONFIRMED (đang sử dụng), nhả tài nguyên
        if ("CONFIRMED".equals(oldStatus)) {
            releaseResources(reservation.getChargingPoint());
        }
        
        log.info("✅ Cancelled reservation {}", reservationId);
        return savedReservation;
    }

    // ==================== Scheduled Tasks ====================

    /**
     * Chạy mỗi 1 phút để kiểm tra và xử lý reservations
     */
    @Scheduled(fixedRate = 60000) // 1 phút
    @Transactional
    public void processReservations() {
        LocalDateTime now = LocalDateTime.now();
        
        // 1. Xử lý expired reservations
        processExpiredReservations(now);
        
        // 2. Xử lý starting reservations
        processStartingReservations(now);
    }

    private void processExpiredReservations(LocalDateTime now) {
        log.debug("🔍 Checking for expired reservations at {}", now);
        
        // Tìm reservations đã hết hạn
        List<Reservation> expiredReservations = reservationRepository
                .findExpiredReservations(now, List.of("PENDING", "CONFIRMED"));
        
        if (expiredReservations.isEmpty()) {
            return;
        }
        
        log.info("⚠️ Found {} expired reservations", expiredReservations.size());
        
        for (Reservation reservation : expiredReservations) {
            try {
                log.info("📋 Processing expired reservation ID: {}, Status: {}, EndTime: {}", 
                        reservation.getId(), 
                        reservation.getStatus(),
                        reservation.getEndTime());
                
                // Cập nhật status thành EXPIRED
                reservation.setStatus("EXPIRED");
                reservationRepository.save(reservation);
                
                // Nhả tài nguyên
                ChargingPoint chargingPoint = reservation.getChargingPoint();
                if (chargingPoint != null) {
                    releaseResources(chargingPoint);
                }
                
                log.info("✅ Successfully expired reservation {}", reservation.getId());
                        
            } catch (Exception e) {
                log.error("❌ Error processing expired reservation {}: {}", 
                        reservation.getId(), e.getMessage(), e);
            }
        }
    }

    private void processStartingReservations(LocalDateTime now) {
        LocalDateTime soon = now.plusMinutes(5);
        
        // Tìm reservations sắp bắt đầu
        List<Reservation> startingReservations = reservationRepository
                .findReservationsStartingSoon(now, soon, "PENDING");
        
        if (startingReservations.isEmpty()) {
            return;
        }
        
        log.info("🔔 Found {} reservations starting soon", startingReservations.size());
        
        for (Reservation reservation : startingReservations) {
            try {
                log.info("📋 Confirming reservation ID: {}, StartTime: {}", 
                        reservation.getId(), 
                        reservation.getStartTime());
                
                // Cập nhật status thành CONFIRMED
                reservation.setStatus("CONFIRMED");
                reservationRepository.save(reservation);
                
                // Đánh dấu tài nguyên đang sử dụng
                ChargingPoint chargingPoint = reservation.getChargingPoint();
                if (chargingPoint != null) {
                    reserveResources(chargingPoint);
                }
                
                log.info("✅ Successfully confirmed reservation {}", reservation.getId());
                        
            } catch (Exception e) {
                log.error("❌ Error confirming reservation {}: {}", 
                        reservation.getId(), e.getMessage(), e);
            }
        }
    }

    // ==================== Helper Methods ====================

    /**
     * Đánh dấu tài nguyên đang được sử dụng (khi reservation CONFIRMED)
     */
    private void reserveResources(ChargingPoint chargingPoint) {
        if (chargingPoint == null) return;
        
        // 1. Cập nhật ChargingPoint thành BOOKED
        chargingPoint.setStatus("BOOKED");
        chargingPointRepository.save(chargingPoint);
        log.info("🔒 Set ChargingPoint {} to BOOKED", chargingPoint.getId());
        
        // 2. Cập nhật ChargingStation
        ChargingStation station = chargingPoint.getStation();
        if (station != null) {
            updateStationStatus(station);
        }
    }

    /**
     * Nhả tài nguyên về trạng thái sẵn sàng (khi reservation EXPIRED/CANCELLED)
     */
    private void releaseResources(ChargingPoint chargingPoint) {
        if (chargingPoint == null) return;
        
        log.info("🔓 Releasing resources for ChargingPoint {}, current status: {}", 
                chargingPoint.getId(), 
                chargingPoint.getStatus());
        
        // 1. Nhả ChargingPoint về ACTIVE
        if ("BOOKED".equals(chargingPoint.getStatus()) || "USING".equals(chargingPoint.getStatus())) {
            chargingPoint.setStatus("ACTIVE");
            chargingPointRepository.save(chargingPoint);
            log.info("✅ Released ChargingPoint {} to ACTIVE", chargingPoint.getId());
        }
        
        // 2. Cập nhật ChargingStation
        ChargingStation station = chargingPoint.getStation();
        if (station != null) {
            updateStationStatus(station);
        }
    }

    /**
     * Cập nhật status của station dựa trên các points
     */
    private void updateStationStatus(ChargingStation station) {
        if (station == null) return;
        
        List<ChargingPoint> points = station.getChargingPoints();
        if (points == null || points.isEmpty()) return;
        
        log.debug("🔍 Updating station {} status, current points status: {}", 
                station.getId(),
                points.stream().map(ChargingPoint::getStatus).toList());
        
        // Đếm số lượng point theo status
        long activeCount = points.stream()
                .filter(p -> "ACTIVE".equals(p.getStatus()))
                .count();
        
        long maintenanceCount = points.stream()
                .filter(p -> "MAINTENANCE".equals(p.getStatus()))
                .count();
        
        // Xác định status mới của station
        String newStatus;
        if (maintenanceCount == points.size()) {
            newStatus = "MAINTENANCE";
        } else if (activeCount > 0) {
            newStatus = "ACTIVE";
        } else {
            newStatus = "USING"; // Tất cả points đang BOOKED/USING
        }
        
        // Cập nhật nếu status thay đổi
        if (!newStatus.equals(station.getStatus())) {
            String oldStatus = station.getStatus();
            station.setStatus(newStatus);
            chargingStationRepository.save(station);
            log.info("✅ Updated ChargingStation {} status: {} -> {}", 
                    station.getId(), oldStatus, newStatus);
            
            // 3. Cập nhật Facility
            updateFacilityStatus(station.getFacility());
        }
    }

    /**
     * Cập nhật status của facility dựa trên các stations
     */
    private void updateFacilityStatus(Facility facility) {
        if (facility == null) return;
        
        List<ChargingStation> stations = facility.getChargingStations();
        if (stations == null || stations.isEmpty()) return;
        
        // Đếm số lượng station theo status
        long activeCount = stations.stream()
                .filter(s -> "ACTIVE".equals(s.getStatus()))
                .count();
        
        long maintenanceCount = stations.stream()
                .filter(s -> "MAINTENANCE".equals(s.getStatus()))
                .count();
        
        // Xác định status mới của facility
        String newStatus;
        if (maintenanceCount == stations.size()) {
            newStatus = "MAINTENANCE";
        } else if (activeCount > 0) {
            newStatus = "ACTIVE";
        } else {
            newStatus = "USING";
        }
        
        // Cập nhật nếu status thay đổi
        if (!newStatus.equals(facility.getStatus())) {
            String oldStatus = facility.getStatus();
            facility.setStatus(newStatus);
            facilityRepository.save(facility);
            log.info("✅ Updated Facility {} status: {} -> {}", 
                    facility.getId(), oldStatus, newStatus);
        }
    }

    private boolean isTimeOverlap(LocalDateTime start1, LocalDateTime end1,
                                   LocalDateTime start2, LocalDateTime end2) {
        return start1.isBefore(end2) && start2.isBefore(end1);
    }
}