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

        Driver driver = driverService.findById(request.getDriverId())
                .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + request.getDriverId()));

        // Validation: Check có active plan không
        Optional<PlanRegistration> activePlan = planRegistrationRepository
                .findActiveByDriverId(request.getDriverId(), LocalDate.now());

        if (activePlan.isEmpty()) {
            throw new RuntimeException("Bạn chưa có gói đăng ký. Vui lòng đăng ký gói trước khi sử dụng.");
        }

        // Kiểm tra driver có session đang charging chưa
        if (chargingSessionRepository.existsByDriverIdAndStatus(request.getDriverId(), STATUS_CHARGING)) {
            throw new RuntimeException("Driver already has an active charging session");
        }

        Vehicle vehicle = vehicleService.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found with ID: " + request.getVehicleId()));

        if (!vehicle.getDriver().getId().equals(request.getDriverId())) {
            throw new RuntimeException("Vehicle does not belong to this driver");
        }

        ChargingPoint chargingPoint = chargingPointService.findById(request.getChargingPointId())
                .orElseThrow(() -> new RuntimeException("Charging point not found with ID: " + request.getChargingPointId()));

        if (!"active".equals(chargingPoint.getStatus())) {
            throw new RuntimeException("Charging point must be 'active' to start charging");
        }

        Optional<ChargingSession> pointSession =
                chargingSessionRepository.findActiveSessionByChargingPointId(request.getChargingPointId());
        if (pointSession.isPresent()) {
            throw new RuntimeException("Charging point is currently in use");
        }

        ChargingStation station = chargingPoint.getStation();
        if (station != null && "inactive".equals(station.getStatus())) {
            throw new RuntimeException("Charging station is inactive");
        }

        // Tạo session mới với status CHARGING
        ChargingSession session = new ChargingSession();
        session.setDriver(driver);
        session.setVehicle(vehicle);
        session.setChargingPoint(chargingPoint);
        session.setStartTime(LocalDateTime.now());
        session.setStartPercentage(request.getStartPercentage());
        session.setStatus(STATUS_CHARGING);
        session.setKwhUsed(BigDecimal.ZERO);
        session.setCost(BigDecimal.ZERO);
        session.setOverusedTime(BigDecimal.ZERO);

        ChargingSession savedSession = chargingSessionRepository.save(session);
        chargingPointService.startUsingPoint(request.getChargingPointId());

        log.info("Created charging session {} with status '{}' for driver {}",
                savedSession.getId(), STATUS_CHARGING, driver.getId());
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