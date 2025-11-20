package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.dto.request.StartChargingSessionRequest;
import swp391.fa25.swp391.dto.request.StopChargingSessionRequest;
import swp391.fa25.swp391.dto.request.SystemReportRequest;
import swp391.fa25.swp391.entity.*;
import swp391.fa25.swp391.repository.ChargingSessionRepository;
import swp391.fa25.swp391.repository.PlanRegistrationRepository;
import swp391.fa25.swp391.service.IService.IChargingPointService;
import swp391.fa25.swp391.service.IService.IChargingSessionService;
import swp391.fa25.swp391.service.IService.IDriverService;
import swp391.fa25.swp391.service.IService.IVehicleService;
import swp391.fa25.swp391.service.IService.IChargerService;

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
    private final IChargerService chargerService;
    private final ReservationService reservationService;
    private final IncidentReportService incidentReportService;
    private final EmergencyNotificationService emergencyNotificationService; // NEW

    // Hằng số cấu hình - REAL EV CHARGING SYSTEM
    private static final BigDecimal START_FEE = new BigDecimal("5000"); // Phí khởi động phiên sạc (connection fee)
    private static final BigDecimal OVERUSE_PENALTY_PER_MINUTE = new BigDecimal("2000"); // Phí phạt mỗi phút khi xe đã đầy nhưng không rời
    private static final int GRACE_PERIOD_MINUTES = 1; // Thời gian ân hạn sau khi đầy pin
    
    // Hằng số mặc định nếu không có thông tin
    private static final BigDecimal DEFAULT_BATTERY_CAPACITY = new BigDecimal("60"); // 60 kWh (average EV)
    private static final BigDecimal DEFAULT_PRICE_PER_KWH = new BigDecimal("3500"); // 3500 VNĐ/kWh

    // ChargingSession Status Constants
    private static final String STATUS_CHARGING = "charging";      // Đang sạc
    private static final String STATUS_COMPLETED = "completed";    // Hoàn thành

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

        // 5. Validate Charger
        Charger charger = chargerService.findById(request.getChargerId())
                .orElseThrow(() -> new RuntimeException("Charger not found with ID: " + request.getChargerId()));

        //  6. XỬ LÝ SẠC QUA ĐẶT CHỖ (reservation-based charging only)
        Reservation reservation = null;
        String chargerStatus = charger.getStatus();

        if (request.getReservationId() == null) {
            throw new RuntimeException("Reservation ID is required. Please make a reservation first.");
        }

        //  SẠC QUA ĐẶT CHỖ (reservation-based charging)
        log.info("Processing reservation-based charging with reservation ID: {}", request.getReservationId());

        if (!"booked".equalsIgnoreCase(chargerStatus)) {
            throw new RuntimeException("Charger must be in 'booked' status for reservation-based charging");
        }

        // Validate và lấy reservation
        ChargingPoint chargingPoint = charger.getChargingPoint();
        reservation = validateAndGetReservation(
                request.getReservationId(),
                driver.getId(),
                chargingPoint.getId()
        );

        // 7. Kiểm tra charger có đang được sử dụng không
        Optional<ChargingSession> chargerSession =
                chargingSessionRepository.findActiveSessionByChargerId(request.getChargerId());
        if (chargerSession.isPresent()) {
            throw new RuntimeException("Charger is currently in use");
        }

        // 8. Kiểm tra charging point and station status (reuse chargingPoint from line 105)
        if (chargingPoint != null && "inactive".equals(chargingPoint.getStatus())) {
            throw new RuntimeException("Charging point is inactive");
        }
        
        ChargingStation station = chargingPoint != null ? chargingPoint.getStation() : null;
        if (station != null && "inactive".equals(station.getStatus())) {
            throw new RuntimeException("Charging station is inactive");
        }

        //  9. TẠO SESSION VỚI HOẶC KHÔNG CÓ RESERVATION
        ChargingSession session = new ChargingSession();
        session.setDriver(driver);
        session.setVehicle(vehicle);
        session.setCharger(charger);
        session.setReservation(reservation);
        session.setStartTime(LocalDateTime.now());
        session.setStartPercentage(request.getStartPercentage());
        session.setEndPercentage(request.getTargetPercentage());
        session.setStatus(STATUS_CHARGING);
        session.setKwhUsed(BigDecimal.ZERO);
        session.setCost(BigDecimal.ZERO);
        session.setOverusedTime(BigDecimal.ZERO);
        session.setStartFee(START_FEE); // Set phí khởi động

        ChargingSession savedSession = chargingSessionRepository.save(session);

        //  10. CẬP NHẬT TRẠNG THÁI
        // FIX: Nếu có reservation, gọi fulfillReservation()
        if (reservation != null) {
            reservationService.fulfillReservation(reservation.getId());
            log.info("Reservation {} marked as FULFILLED", reservation.getId());
        }

        // Cập nhật charger status
        chargerService.startUsingCharger(request.getChargerId());

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

        // ===== TÍNH TOÁN THÔNG TIN SẠC THEO HỆ THỐNG THỰC TẾ =====
        LocalDateTime endTime = LocalDateTime.now();
        session.setEndTime(endTime);
        session.setEndPercentage(request.getEndPercentage());

        // 1. Tính % pin đã sạc
        int percentageCharged = request.getEndPercentage() - session.getStartPercentage();
        
        // 2. Lấy dung lượng pin xe (kWh)
        Vehicle vehicle = session.getVehicle();
        BigDecimal batteryCapacity = vehicle.getBatteryCapacity() != null 
            ? vehicle.getBatteryCapacity() 
            : DEFAULT_BATTERY_CAPACITY;
        
        // 3. Tính kWh thực tế đã sạc
        // Formula: kWh = (Battery Capacity × % charged) / 100
        // Example: 60 kWh battery, charged from 20% to 80% = 60 × 60 / 100 = 36 kWh
        BigDecimal kwhUsed = batteryCapacity
                .multiply(new BigDecimal(percentageCharged))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        
        // 4. Lấy giá từ Charging Point (VNĐ/kWh)
        Charger charger = session.getCharger();
        ChargingPoint chargingPoint = charger.getChargingPoint();
        BigDecimal pricePerKwh = chargingPoint.getPricePerKwh() != null 
            ? chargingPoint.getPricePerKwh() 
            : DEFAULT_PRICE_PER_KWH;
        
        // 5. Tính chi phí cơ bản
        // Formula: Base Cost = kWh × Price per kWh
        // Example: 36 kWh × 3500 VNĐ/kWh = 126,000 VNĐ
        BigDecimal baseCost = kwhUsed.multiply(pricePerKwh)
                .setScale(0, RoundingMode.HALF_UP);
        
        log.info("Pricing calculation for session {}: Vehicle battery {}kWh, Charged {}%, kWh used: {}, Price/kWh: {}, Base cost: {}",
                sessionId, batteryCapacity, percentageCharged, kwhUsed, pricePerKwh, baseCost);

        // TÍNH THỜI GIAN SẠC THỰC TẾ (Actual charging time = demo 100x nhanh)
        // FE đã có demo speed 100x, nên thời gian sạc thực tế rất ngắn
        // Formula: Charging time = kWh / Power / 100 (do demo 100x)
        BigDecimal chargerMaxPower = charger.getMaxPower(); // kW
        BigDecimal actualChargingTimeHours = kwhUsed.divide(chargerMaxPower, 4, RoundingMode.HALF_UP);
        BigDecimal actualChargingTimeMinutes = actualChargingTimeHours.multiply(BigDecimal.valueOf(60))
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP); // Chia 100 vì demo 100x
        
        // CRITICAL FIX: Tính tổng thời gian session bằng GIÂY để không mất precision
        // Logic giống ActiveSession.jsx: Idle time = Total time - Charging time
        long totalSessionSeconds = java.time.Duration.between(session.getStartTime(), endTime).getSeconds();
        BigDecimal totalSessionMinutes = new BigDecimal(totalSessionSeconds).divide(BigDecimal.valueOf(60), 4, RoundingMode.HALF_UP);
        BigDecimal totalIdleMinutes = totalSessionMinutes.subtract(actualChargingTimeMinutes);
        
        // TÍNH PHÍ PHẠT OVERUSE (Idle time after reaching target %)
        BigDecimal overusePenalty = BigDecimal.ZERO;
        BigDecimal penaltyMinutes = BigDecimal.ZERO; // Thời gian tính phí phạt (sau grace period)
        
        // SIMPLIFIED LOGIC: Giống ActiveSession.jsx
        // Nếu có idle time (đậu xe sau khi sạc xong) → Tính phí phạt
        if (totalIdleMinutes.compareTo(BigDecimal.ZERO) > 0) {
            // FIX: Làm tròn XUỐNG idle time thành số nguyên phút
            int idleMinutesInt = totalIdleMinutes.intValue(); // Floor (làm tròn xuống)
            
            // Chỉ tính phí nếu idle > grace period
            if (idleMinutesInt > GRACE_PERIOD_MINUTES) {
                // CHỈ TÍNH SỐ NGUYÊN PHÚT
                int penaltyMinutesInt = idleMinutesInt - GRACE_PERIOD_MINUTES;
                penaltyMinutes = new BigDecimal(penaltyMinutesInt);
                overusePenalty = penaltyMinutes.multiply(OVERUSE_PENALTY_PER_MINUTE)
                        .setScale(0, RoundingMode.HALF_UP);
                
                log.warn("Idle parking penalty! Session {}: Total session {}min, Charging {}min, Idle {}min (floor), Grace {}min, Penalty: {}min → {} VND",
                        sessionId, totalSessionMinutes.doubleValue(), actualChargingTimeMinutes.doubleValue(), 
                        idleMinutesInt, GRACE_PERIOD_MINUTES, penaltyMinutesInt, overusePenalty);
            } else {
                log.info("Session {}: Idle {}min within grace period ({}min) → No penalty",
                        sessionId, idleMinutesInt, GRACE_PERIOD_MINUTES);
            }
        } else {
            log.info("Session {}: No idle time (stopped immediately after charging) → No penalty", sessionId);
        }
        
        // Lưu thời gian đậu xe (idle time)
        session.setOverusedTime(totalIdleMinutes);

        // FIX: DISCOUNT CHỈ ÁP DỤNG CHO PHÍ ĐIỆN NĂNG (baseCost)
        // Start Fee và Overuse Penalty KHÔNG được giảm giá
        BigDecimal energyCostWithDiscount = applyPlanDiscount(session.getDriver().getId(), baseCost);
        
        // TÍNH TỔNG CHI PHÍ = START_FEE + (BASE_COST - DISCOUNT) + OVERUSE_PENALTY
        BigDecimal finalCost = session.getStartFee()
                .add(energyCostWithDiscount)
                .add(overusePenalty);

        session.setKwhUsed(kwhUsed);
        session.setOverusePenalty(overusePenalty); // ADD: Lưu overuse penalty vào DB
        session.setCost(finalCost);
        session.setStatus(STATUS_COMPLETED);

        ChargingSession updatedSession = chargingSessionRepository.save(session);

        // Giải phóng charger
        chargerService.stopUsingCharger(session.getCharger().getId());

        log.info("Session {} completed. Base cost: {}, Energy cost after discount: {}, Start fee: {}, Overuse penalty: {}, Final cost: {}",
                sessionId, baseCost, energyCostWithDiscount, session.getStartFee(), overusePenalty, finalCost);

        return updatedSession;
    }



    /**
     * NEW: Emergency stop với tính tiền theo % đã sạc và gửi incident report
     * POST /api/charging-sessions/{sessionId}/emergency-stop
     */
    public ChargingSession emergencyStopChargingSession(Integer sessionId, StopChargingSessionRequest request) {
        log.warn("[EMERGENCY STOP] Processing emergency stop for session {}", sessionId);

        ChargingSession session = chargingSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Charging session not found"));

        // Kiểm tra status phải là CHARGING
        if (!STATUS_CHARGING.equalsIgnoreCase(session.getStatus())) {
            throw new RuntimeException("Can only emergency stop sessions with status 'charging'. Current status: " + session.getStatus());
        }

        if (request.getEndPercentage() < session.getStartPercentage()) {
            throw new RuntimeException("End percentage cannot be less than start percentage");
        }

        // ===== TÍNH TOÁN THÔNG TIN SẠC (GIỐNG stopChargingSession) =====
        LocalDateTime endTime = LocalDateTime.now();
        session.setEndTime(endTime);
        session.setEndPercentage(request.getEndPercentage());

        // 1. Tính % pin đã sạc
        int percentageCharged = request.getEndPercentage() - session.getStartPercentage();
        
        // 2. Lấy dung lượng pin xe (kWh)
        Vehicle vehicle = session.getVehicle();
        BigDecimal batteryCapacity = vehicle.getBatteryCapacity() != null 
            ? vehicle.getBatteryCapacity() 
            : DEFAULT_BATTERY_CAPACITY;
        
        // 3. Tính kWh thực tế đã sạc
        BigDecimal kwhUsed = batteryCapacity
                .multiply(new BigDecimal(percentageCharged))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        
        // 4. Lấy giá từ Charging Point (VNĐ/kWh)
        Charger charger = session.getCharger();
        ChargingPoint chargingPoint = charger.getChargingPoint();
        BigDecimal pricePerKwh = chargingPoint.getPricePerKwh() != null 
            ? chargingPoint.getPricePerKwh() 
            : DEFAULT_PRICE_PER_KWH;
        
        // 5. Tính chi phí cơ bản
        BigDecimal baseCost = kwhUsed.multiply(pricePerKwh)
                .setScale(0, RoundingMode.HALF_UP);
        
        log.info("[EMERGENCY STOP] Pricing for session {}: Battery {}kWh, Charged {}%, kWh used: {}, Price/kWh: {}, Base cost: {}",
                sessionId, batteryCapacity, percentageCharged, kwhUsed, pricePerKwh, baseCost);

        // 6. Áp dụng discount cho năng lượng
        BigDecimal energyCostWithDiscount = applyPlanDiscount(session.getDriver().getId(), baseCost);
        
        // 7. Tính tổng chi phí (START_FEE + ENERGY_COST với discount, KHÔNG có overuse penalty)
        BigDecimal finalCost = session.getStartFee()
                .add(energyCostWithDiscount);

        session.setKwhUsed(kwhUsed);
        session.setOverusePenalty(BigDecimal.ZERO); // Emergency stop không tính overuse penalty
        session.setCost(finalCost);
        session.setStatus(STATUS_COMPLETED); // ⭐ Đánh dấu là completed để tính tiền

        ChargingSession updatedSession = chargingSessionRepository.save(session);

        // Giải phóng charger
        chargerService.stopUsingCharger(session.getCharger().getId());

        log.info("[EMERGENCY STOP] Session {} completed. Final cost: {} VND", sessionId, finalCost);

        // GỬI THÔNG BÁO ĐẾN EMPLOYEE
        // KHÔNG tạo incident report tự động
        // Employee sẽ kiểm tra và tự tạo incident nếu cần thiết
        try {
            emergencyNotificationService.createEmergencyStopNotification(session);
            log.info("[EMERGENCY STOP] Notification sent to employees for session {}", sessionId);
            
        } catch (Exception e) {
            log.error("[EMERGENCY STOP] Failed to send notification: {}", e.getMessage());
            // Không throw exception vì session đã hoàn tất thành công
        }

        return updatedSession;
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

    /**
     * Tính thời gian vượt quá khi đã đầy pin - REALISTIC CALCULATION
     * @param session ChargingSession
     * @param endTime Thời gian kết thúc phiên sạc
     * @return Số phút vượt quá
     */
    private BigDecimal calculateOveruseTime(ChargingSession session, LocalDateTime endTime) {
        // 1. Lấy thông tin xe và charger
        Vehicle vehicle = session.getVehicle();
        Charger charger = session.getCharger();
        
        BigDecimal batteryCapacity = vehicle.getBatteryCapacity() != null 
            ? vehicle.getBatteryCapacity() 
            : DEFAULT_BATTERY_CAPACITY;
        
        BigDecimal chargerMaxPower = charger.getMaxPower(); // kW
        
        // 2. Tính kWh cần sạc
        int percentageCharged = session.getEndPercentage() - session.getStartPercentage();
        BigDecimal kwhToCharge = batteryCapacity
                .multiply(new BigDecimal(percentageCharged))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        
        // 3. Tính thời gian sạc thực tế (phút)
        // Formula: Time (hours) = Energy (kWh) / Power (kW)
        // Example: 36 kWh / 50 kW = 0.72 hours = 43.2 minutes
        BigDecimal chargingTimeHours = kwhToCharge.divide(chargerMaxPower, 4, RoundingMode.HALF_UP);
        BigDecimal chargingTimeMinutes = chargingTimeHours.multiply(BigDecimal.valueOf(60));
        
        // 4. Thời gian dự kiến hoàn thành
        LocalDateTime estimatedFullTime = session.getStartTime()
                .plusMinutes(chargingTimeMinutes.longValue());
        
        // 5. Tính thời gian vượt quá
        long minutesOveruse = java.time.Duration.between(estimatedFullTime, endTime).toMinutes();
        
        log.info("⏱️ Charging time calculation: {}kWh at {}kW = {} hours ({} minutes). Estimated full: {}, Actual stop: {}, Overuse: {} minutes",
                kwhToCharge, chargerMaxPower, chargingTimeHours, chargingTimeMinutes.intValue(), 
                estimatedFullTime, endTime, minutesOveruse);
        
        // Nếu âm (dừng trước khi đầy) thì return 0
        return minutesOveruse > 0 ? new BigDecimal(minutesOveruse) : BigDecimal.ZERO;
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
    public Optional<ChargingSession> findActiveSessionByChargerId(Integer chargerId) {
        return chargingSessionRepository.findActiveSessionByChargerId(chargerId);
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