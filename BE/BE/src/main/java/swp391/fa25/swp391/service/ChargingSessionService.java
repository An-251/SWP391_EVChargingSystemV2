package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.dto.request.StartChargingSessionRequest;
import swp391.fa25.swp391.dto.request.StopChargingSessionRequest;
import swp391.fa25.swp391.entity.*;
import swp391.fa25.swp391.repository.ChargingSessionRepository;
import swp391.fa25.swp391.repository.PlanRegistrationRepository;
import swp391.fa25.swp391.service.IService.IChargingPointService;
import swp391.fa25.swp391.service.IService.IChargingSessionService;
import swp391.fa25.swp391.service.IService.IDriverService;
import swp391.fa25.swp391.service.IService.IVehicleService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ChargingSessionService implements IChargingSessionService {

    private final ChargingSessionRepository chargingSessionRepository;
    private final PlanRegistrationRepository planRegistrationRepository;
    private final IDriverService driverService;
    private final IVehicleService vehicleService;
    private final IChargingPointService chargingPointService;
    private final ReservationService reservationService;

    // Hằng số cấu hình
    private static final BigDecimal KWH_PER_PERCENT = new BigDecimal("0.5");
    private static final BigDecimal COST_PER_KWH = new BigDecimal("3000");

    // ChargingSession Status Constants
    private static final String STATUS_CHARGING = "charging";      // Đang sạc
    private static final String STATUS_COMPLETED = "completed";    // Hoàn thành
    private static final String STATUS_CANCELLED = "cancelled";    // Đã hủy
    private static final String STATUS_FAILED = "failed";          // Lỗi hệ thống
    private static final String STATUS_INTERRUPTED = "interrupted"; // Bị gián đoạn

    @Override
    public ChargingSession startChargingSession(StartChargingSessionRequest request) {
        log.info("Starting charging session for driver {}", request.getDriverId());

        // 1. Validate Driver
        Driver driver = driverService.findById(request.getDriverId())
                .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + request.getDriverId()));

        // 2. Validate Active Plan
        Optional<PlanRegistration> activePlan = planRegistrationRepository
                .findActiveByDriverId(request.getDriverId(), LocalDate.now());
        if (activePlan.isEmpty()) {
            throw new RuntimeException("Bạn chưa có gói đăng ký. Vui lòng đăng ký gói trước khi sử dụng.");
        }

        // 3. Kiểm tra driver có session đang charging chưa
        if (chargingSessionRepository.existsByDriverIdAndStatus(request.getDriverId(), STATUS_CHARGING)) {
            throw new RuntimeException("Driver already has an active charging session");
        }

        // 4. Validate Vehicle
        Vehicle vehicle = vehicleService.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found with ID: " + request.getVehicleId()));
        if (!vehicle.getDriver().getId().equals(request.getDriverId())) {
            throw new RuntimeException("Vehicle does not belong to this driver");
        }

        // 5. Validate Charging Point
        ChargingPoint chargingPoint = chargingPointService.findById(request.getChargingPointId())
                .orElseThrow(() -> new RuntimeException("Charging point not found with ID: " + request.getChargingPointId()));

        //  6. XỬ LÝ 2 TRƯỜNG HỢP: SẠC QUA ĐẶT CHỖ HOẶC SẠC TRỰC TIẾP
        Reservation reservation = null;
        String pointStatus = chargingPoint.getStatus();

        if (request.getReservationId() != null) {
            //  CASE 1: SẠC QUA ĐẶT CHỖ (reservation-based charging)
            log.info("Processing reservation-based charging with reservation ID: {}", request.getReservationId());

            if (!"booked".equalsIgnoreCase(pointStatus)) {
                throw new RuntimeException("Charging point must be in 'booked' status for reservation-based charging");
            }

            // Validate và lấy reservation
            reservation = validateAndGetReservation(
                    request.getReservationId(),
                    driver.getId(),
                    chargingPoint.getId()
            );

        } else {
            //  CASE 2: SẠC TRỰC TIẾP - WALK-IN (direct charging without reservation)
            log.info("Processing direct walk-in charging (no reservation)");

            if (!"active".equalsIgnoreCase(pointStatus)) {
                if ("booked".equalsIgnoreCase(pointStatus)) {
                    throw new RuntimeException("This charging point is currently reserved. Please use your reservation ID or choose another point.");
                } else if ("using".equalsIgnoreCase(pointStatus)) {
                    throw new RuntimeException("Charging point is currently in use");
                } else if ("maintenance".equalsIgnoreCase(pointStatus)) {
                    throw new RuntimeException("Charging point is under maintenance");
                } else {
                    throw new RuntimeException("Charging point must be 'active' for direct charging");
                }
            }
        }

        // 7. Kiểm tra charging point có đang được sử dụng không
        Optional<ChargingSession> pointSession =
                chargingSessionRepository.findActiveSessionByChargingPointId(request.getChargingPointId());
        if (pointSession.isPresent()) {
            throw new RuntimeException("Charging point is currently in use");
        }

        // 8. Kiểm tra station status
        ChargingStation station = chargingPoint.getStation();
        if (station != null && "inactive".equals(station.getStatus())) {
            throw new RuntimeException("Charging station is inactive");
        }

        //  9. TẠO SESSION VỚI HOẶC KHÔNG CÓ RESERVATION
        ChargingSession session = new ChargingSession();
        session.setDriver(driver);
        session.setVehicle(vehicle);
        session.setChargingPoint(chargingPoint);
        session.setReservation(reservation); //  Có thể là null (walk-in) hoặc có giá trị (reservation)
        session.setStartTime(LocalDateTime.now());
        session.setStartPercentage(request.getStartPercentage());
        session.setEndPercentage(request.getTargetPercentage()); // Set target percentage as end percentage
        session.setStatus(STATUS_CHARGING);
        session.setKwhUsed(BigDecimal.ZERO);
        session.setCost(BigDecimal.ZERO);
        session.setOverusedTime(BigDecimal.ZERO);

        ChargingSession savedSession = chargingSessionRepository.save(session);

        //  10. CẬP NHẬT TRẠNG THÁI
        // Nếu có reservation, cập nhật status thành FULFILLED
        if (reservation != null) {
            reservation.setStatus("FULFILLED");
            reservationService.createReservation(reservation);
            log.info("Reservation {} marked as FULFILLED", reservation.getId());
        }

        // Cập nhật charging point status
        chargingPointService.startUsingPoint(request.getChargingPointId());

        log.info("Created charging session {} with status '{}' for driver {} (reservation: {})",
                savedSession.getId(), STATUS_CHARGING, driver.getId(),
                reservation != null ? reservation.getId() : "none");

        return savedSession;
    }

    @Override
    public ChargingSession stopChargingSession(Integer sessionId, StopChargingSessionRequest request) {
        log.info("Stopping charging session {}", sessionId);

        ChargingSession session = chargingSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Charging session not found"));

        // Kiểm tra status phải là CHARGING
        if (!STATUS_CHARGING.equalsIgnoreCase(session.getStatus())) {
            throw new RuntimeException("Can only stop sessions with status 'charging'. Current status: " + session.getStatus());
        }

        if (request.getEndPercentage() < session.getStartPercentage()) {
            throw new RuntimeException("End percentage cannot be less than start percentage");
        }

        // Tính toán thông tin sạc
        LocalDateTime endTime = LocalDateTime.now();
        session.setEndTime(endTime);
        session.setEndPercentage(request.getEndPercentage());

        int percentageCharged = request.getEndPercentage() - session.getStartPercentage();
        BigDecimal kwhUsed = KWH_PER_PERCENT.multiply(new BigDecimal(percentageCharged))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal baseCost = kwhUsed.multiply(COST_PER_KWH)
                .setScale(0, RoundingMode.HALF_UP);

        BigDecimal finalCost = applyPlanDiscount(session.getDriver().getId(), baseCost);

        session.setKwhUsed(kwhUsed);
        session.setCost(finalCost);
        session.setStatus(STATUS_COMPLETED);

        ChargingSession updatedSession = chargingSessionRepository.save(session);

        // Giải phóng charging point
        chargingPointService.stopUsingPoint(session.getChargingPoint().getId());

        log.info("Session {} '{}'. Base cost: {}, Final cost (with discount): {}",
                sessionId, STATUS_COMPLETED, baseCost, finalCost);

        return updatedSession;
    }

    @Override
    public void cancelChargingSession(Integer sessionId) {
        log.info("Cancelling charging session {}", sessionId);

        ChargingSession session = chargingSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Charging session not found"));

        // Kiểm tra status phải là CHARGING
        if (!STATUS_CHARGING.equalsIgnoreCase(session.getStatus())) {
            throw new RuntimeException("Can only cancel sessions with status 'charging'");
        }

        session.setStatus(STATUS_CANCELLED);
        session.setEndTime(LocalDateTime.now());
        chargingSessionRepository.save(session);

        chargingPointService.stopUsingPoint(session.getChargingPoint().getId());

        log.info("Session {} marked as '{}'", sessionId, STATUS_CANCELLED);
    }

    /**
     * Đánh dấu session bị lỗi (system error)
     */
    public void failChargingSession(Integer sessionId, String reason) {
        log.warn("Marking charging session {} as '{}'. Reason: {}", sessionId, STATUS_FAILED, reason);

        ChargingSession session = chargingSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Charging session not found"));

        if (!STATUS_CHARGING.equalsIgnoreCase(session.getStatus())) {
            throw new RuntimeException("Can only fail active charging sessions");
        }

        session.setStatus(STATUS_FAILED);
        session.setEndTime(LocalDateTime.now());
        chargingSessionRepository.save(session);

        chargingPointService.stopUsingPoint(session.getChargingPoint().getId());

        log.error("Session {} marked as '{}': {}", sessionId, STATUS_FAILED, reason);
    }

    /**
     * Đánh dấu session bị gián đoạn (connection lost)
     */
    public void interruptChargingSession(Integer sessionId) {
        log.warn("Marking charging session {} as '{}'", sessionId, STATUS_INTERRUPTED);

        ChargingSession session = chargingSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Charging session not found"));

        if (!STATUS_CHARGING.equalsIgnoreCase(session.getStatus())) {
            throw new RuntimeException("Session is not active");
        }

        session.setStatus(STATUS_INTERRUPTED);
        session.setEndTime(LocalDateTime.now());
        chargingSessionRepository.save(session);

        chargingPointService.stopUsingPoint(session.getChargingPoint().getId());

        log.warn("Session {} marked as '{}'", sessionId, STATUS_INTERRUPTED);
    }

    private BigDecimal applyPlanDiscount(Integer driverId, BigDecimal baseCost) {
        Optional<PlanRegistration> activePlan = planRegistrationRepository
                .findActiveByDriverId(driverId, LocalDate.now());

        if (activePlan.isEmpty()) {
            log.warn("No active plan found for driver {}. Using base cost.", driverId);
            return baseCost;
        }

        SubscriptionPlan plan = activePlan.get().getPlan();

        if (plan.getDiscountRate() == null || plan.getDiscountRate().compareTo(BigDecimal.ZERO) == 0) {
            log.info("Driver {} using plan {} with no discount", driverId, plan.getPlanName());
            return baseCost;
        }

        BigDecimal discountAmount = baseCost
                .multiply(plan.getDiscountRate())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal finalCost = baseCost.subtract(discountAmount);

        log.info("Driver {} using plan {} ({}% off). Base: {}, Discount: {}, Final: {}",
                driverId, plan.getPlanName(), plan.getDiscountRate(),
                baseCost, discountAmount, finalCost);

        return finalCost;
    }

    // ======= Các method hỗ trợ =======

    @Override
    @Transactional(readOnly = true)
    public Optional<ChargingSession> findById(Integer id) {
        return chargingSessionRepository.findById(id);
    }

    /**
     * Validate reservation when starting charging session
     */
    private Reservation validateAndGetReservation(Long reservationId, Integer driverId, Integer chargingPointId) {
        Reservation reservation = reservationService.findById(reservationId.intValue());

        if (reservation == null) {
            throw new RuntimeException("Reservation not found");
        }

        // Kiểm tra reservation có phải của driver này không
        if (!reservation.getDriver().getId().equals(driverId)) {
            throw new RuntimeException("This reservation belongs to another driver");
        }

        // Kiểm tra reservation có phải cho charging point này không
        if (!reservation.getChargingPoint().getId().equals(chargingPointId)) {
            throw new RuntimeException("This reservation is for another charging point");
        }

        // Kiểm tra trạng thái reservation
        String reservationStatus = reservation.getStatus();
        if (!"ACTIVE".equalsIgnoreCase(reservationStatus)) {
            throw new RuntimeException("Invalid reservation status: " + reservationStatus + ". Only ACTIVE reservations can be used.");
        }

        // Kiểm tra thời gian
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(reservation.getStartTime())) {
            throw new RuntimeException("Too early! Reservation starts at: " + reservation.getStartTime());
        }
        if (now.isAfter(reservation.getEndTime())) {
            throw new RuntimeException("Reservation has expired at: " + reservation.getEndTime());
        }

        return reservation;
    }

    @Override
    @Transactional(readOnly = true)
    public ChargingSession getSessionById(Integer id) {
        return chargingSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Charging session not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ChargingSession> findActiveSessionByDriverId(Integer driverId) {
        return chargingSessionRepository.findActiveSessionByDriverId(driverId);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ChargingSession> findActiveSessionByChargingPointId(Integer chargingPointId) {
        return chargingSessionRepository.findActiveSessionByChargingPointId(chargingPointId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChargingSession> findByDriverId(Integer driverId) {
        return chargingSessionRepository.findByDriverIdOrderByStartTimeDesc(driverId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChargingSession> findByStatus(String status) {
        return chargingSessionRepository.findByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateTotalCostByDriver(Integer driverId) {
        return chargingSessionRepository.calculateTotalCostByDriver(driverId);
    }

    @Override
    @Transactional(readOnly = true)
    public Long countByStatus(String status) {
        return chargingSessionRepository.countByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ChargingSession> findByDriverId(Integer driverId, Pageable pageable) {
        return chargingSessionRepository.findByDriverIdOrderByStartTimeDesc(driverId, pageable);
    }

}