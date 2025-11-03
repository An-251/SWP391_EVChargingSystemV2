package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.entity.ChargingPoint;
import swp391.fa25.swp391.entity.ChargingStation;
import swp391.fa25.swp391.entity.Reservation;
import swp391.fa25.swp391.repository.ChargingPointRepository;
import swp391.fa25.swp391.repository.ChargingStationRepository;
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

    // ==================== CRUD Operations ====================

    @Transactional
    public Reservation createReservation(Reservation reservation) {
        // Kiểm tra xem charging point có available không
        ChargingPoint chargingPoint = reservation.getChargingPoint();
        
        if (!"ACTIVE".equals(chargingPoint.getStatus())) {
            throw new RuntimeException("Charging point is not available");
        }
        
        // Kiểm tra xem charging point có bị trùng lịch không
        List<Reservation> existingReservations = reservationRepository
                .findByChargingPointIdAndStatusNot(chargingPoint.getId(), "CANCELLED");

        for (Reservation existing : existingReservations) {
            if (isTimeOverlap(reservation.getStartTime(), reservation.getEndTime(),
                    existing.getStartTime(), existing.getEndTime())) {
                throw new RuntimeException("Charging point is already reserved for this time slot");
            }
        }

        // Đặt status và lưu reservation
        reservation.setStatus("PENDING");
        Reservation savedReservation = reservationRepository.save(reservation);
        
        log.info("✅ Created reservation {} for driver {}", 
                savedReservation.getId(), 
                savedReservation.getDriver().getId());
        
        return savedReservation;
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

        // Cập nhật status
        reservation.setStatus("CANCELLED");
        Reservation savedReservation = reservationRepository.save(reservation);
        
        // Nếu charging point đang USING, nhả về ACTIVE
        ChargingPoint chargingPoint = reservation.getChargingPoint();
        if ("CONFIRMED".equals(reservation.getStatus()) && 
            chargingPoint != null && 
            "USING".equals(chargingPoint.getStatus())) {
            
            chargingPoint.setStatus("ACTIVE");
            chargingPointRepository.save(chargingPoint);
            
            // Cập nhật station status
            updateStationStatus(chargingPoint.getStation());
            
            log.info("✅ Released ChargingPoint {} to ACTIVE after cancellation", 
                    chargingPoint.getId());
        }
        
        return savedReservation;
    }

    // ==================== Scheduled Tasks ====================

    /**
     * Chạy mỗi 5 phút để kiểm tra reservation đã hết hạn
     */
    @Scheduled(fixedRate = 300000) // 5 phút = 300,000 ms
    @Transactional
    public void checkExpiredReservations() {
        log.info("🔍 Checking for expired reservations...");
        
        LocalDateTime now = LocalDateTime.now();
        
        // Tìm các reservation đã hết hạn nhưng vẫn ở trạng thái PENDING hoặc CONFIRMED
        List<Reservation> expiredReservations = reservationRepository
                .findExpiredReservations(now, List.of("PENDING", "CONFIRMED"));
        
        if (expiredReservations.isEmpty()) {
            log.info("✅ No expired reservations found");
            return;
        }
        
        log.info("⚠️ Found {} expired reservations", expiredReservations.size());
        
        for (Reservation reservation : expiredReservations) {
            try {
                // Cập nhật status của reservation
                reservation.setStatus("EXPIRED");
                reservationRepository.save(reservation);
                
                // Nhả charging point về ACTIVE
                ChargingPoint chargingPoint = reservation.getChargingPoint();
                if (chargingPoint != null && "USING".equals(chargingPoint.getStatus())) {
                    chargingPoint.setStatus("ACTIVE");
                    chargingPointRepository.save(chargingPoint);
                    log.info("✅ Released ChargingPoint {} to ACTIVE", chargingPoint.getId());
                }
                
                // Kiểm tra xem station có point nào đang ACTIVE không
                ChargingStation station = chargingPoint.getStation();
                if (station != null) {
                    updateStationStatus(station);
                }
                
                log.info("✅ Expired reservation {} for driver {}", 
                        reservation.getId(), 
                        reservation.getDriver().getId());
                        
            } catch (Exception e) {
                log.error("❌ Error processing expired reservation {}: {}", 
                        reservation.getId(), e.getMessage());
            }
        }
    }

    /**
     * Chạy mỗi phút để kiểm tra reservation sắp bắt đầu
     */
    @Scheduled(fixedRate = 60000) // 1 phút = 60,000 ms
    @Transactional
    public void checkStartingReservations() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime soon = now.plusMinutes(5); // Trong vòng 5 phút tới
        
        // Tìm các reservation sắp bắt đầu
        List<Reservation> startingReservations = reservationRepository
                .findReservationsStartingSoon(now, soon, "PENDING");
        
        if (startingReservations.isEmpty()) {
            return;
        }
        
        log.info("🔔 Found {} reservations starting soon", startingReservations.size());
        
        for (Reservation reservation : startingReservations) {
            try {
                // Cập nhật status thành CONFIRMED
                reservation.setStatus("CONFIRMED");
                reservationRepository.save(reservation);
                
                // Cập nhật charging point thành USING
                ChargingPoint chargingPoint = reservation.getChargingPoint();
                if (chargingPoint != null) {
                    chargingPoint.setStatus("USING");
                    chargingPointRepository.save(chargingPoint);
                    
                    // Cập nhật station status
                    updateStationStatus(chargingPoint.getStation());
                }
                
                log.info("✅ Confirmed reservation {} for driver {}", 
                        reservation.getId(), 
                        reservation.getDriver().getId());
                        
            } catch (Exception e) {
                log.error("❌ Error confirming reservation {}: {}", 
                        reservation.getId(), e.getMessage());
            }
        }
    }

    // ==================== Helper Methods ====================

    private boolean isTimeOverlap(LocalDateTime start1, LocalDateTime end1,
                                   LocalDateTime start2, LocalDateTime end2) {
        return start1.isBefore(end2) && start2.isBefore(end1);
    }

    /**
     * Cập nhật status của station dựa trên status của các point
     */
    private void updateStationStatus(ChargingStation station) {
        if (station == null) return;
        
        List<ChargingPoint> points = station.getChargingPoints();
        if (points == null || points.isEmpty()) {
            return;
        }
        
        // Đếm số lượng point theo status
        long activeCount = points.stream()
                .filter(p -> "ACTIVE".equals(p.getStatus()))
                .count();
        
        long maintenanceCount = points.stream()
                .filter(p -> "MAINTENANCE".equals(p.getStatus()))
                .count();
        
        // Xác định status của station
        String newStatus;
        if (maintenanceCount == points.size()) {
            newStatus = "MAINTENANCE";
        } else if (activeCount > 0) {
            newStatus = "ACTIVE";
        } else {
            newStatus = "FULL";
        }
        
        // Chỉ cập nhật nếu status thay đổi
        if (!newStatus.equals(station.getStatus())) {
            station.setStatus(newStatus);
            chargingStationRepository.save(station);
            log.info("✅ Updated ChargingStation {} status to {}", station.getId(), newStatus);
        }
    }
}