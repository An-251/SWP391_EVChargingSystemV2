package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.dto.request.EmpStartSessionRequest;
import swp391.fa25.swp391.dto.request.EmpStopSessionRequest;
import swp391.fa25.swp391.entity.*;
import swp391.fa25.swp391.repository.ChargingSessionRepository;
import swp391.fa25.swp391.repository.VehicleRepository;
import swp391.fa25.swp391.service.IService.IChargingPointService;
import swp391.fa25.swp391.service.IService.IEnterpriseChargingService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class EnterpriseChargingService implements IEnterpriseChargingService {

    private final ChargingSessionRepository chargingSessionRepository;
    private final VehicleRepository vehicleRepository;
    private final IChargingPointService chargingPointService;

    // Lấy hằng số từ ChargingSessionService của bạn
    // TODO: Nên đưa các hằng số này ra file config chung
    private static final BigDecimal KWH_PER_PERCENT = new BigDecimal("0.5");
    private static final BigDecimal COST_PER_KWH = new BigDecimal("3000");
    private static final String STATUS_CHARGING = "charging";
    private static final String STATUS_COMPLETED = "completed";

    @Override
    public ChargingSession startEnterpriseSession(EmpStartSessionRequest request, StationEmployee employee) {
        log.info("Employee {} starting enterprise charging session", employee.getId());

        // 1. Validate Vehicle
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found with ID: " + request.getVehicleId()));

        // 2. KIỂM TRA QUAN TRỌNG: Xe này phải là xe của Enterprise
        if (vehicle.getEnterprise() == null) {
            throw new RuntimeException("Vehicle ID " + request.getVehicleId() + " is not an enterprise vehicle.");
        }

        // 3. Validate Charging Point (Giống logic cũ)
        ChargingPoint chargingPoint = chargingPointService.findById(request.getChargingPointId())
                .orElseThrow(() -> new RuntimeException("Charging point not found with ID: " + request.getChargingPointId()));

        if (!"active".equalsIgnoreCase(chargingPoint.getStatus())) {
            throw new RuntimeException("Charging point is not 'active'. Current status: " + chargingPoint.getStatus());
        }

        // 4. Kiểm tra trạm
        ChargingStation station = chargingPoint.getStation();
        if (station != null && "inactive".equals(station.getStatus())) {
            throw new RuntimeException("Charging station is inactive");
        }

        // 5. Tạo Session
        ChargingSession session = new ChargingSession();
        session.setVehicle(vehicle);
        session.setDriver(null); // Không có Driver
        session.setStartedByEmployee(employee); // Gán nhân viên
        session.setChargingPoint(chargingPoint);
        session.setStartTime(LocalDateTime.now());
        session.setStartPercentage(request.getStartPercentage());
        session.setStatus(STATUS_CHARGING);

        // Set giá trị mặc định
        session.setKwhUsed(BigDecimal.ZERO);
        session.setCost(BigDecimal.ZERO);
        session.setOverusedTime(BigDecimal.ZERO);

        ChargingSession savedSession = chargingSessionRepository.save(session);

        // 6. Cập nhật charging point status
        chargingPointService.startUsingPoint(request.getChargingPointId());

        log.info("Created enterprise charging session {} for vehicle {}", savedSession.getId(), vehicle.getId());
        return savedSession;
    }

    @Override
    public ChargingSession stopEnterpriseSession(Integer sessionId, EmpStopSessionRequest request, StationEmployee employee) {
        log.info("Employee {} stopping enterprise charging session {}", employee.getId(), sessionId);

        // 1. Tìm Session
        ChargingSession session = chargingSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Charging session not found"));

        // 2. Validate session
        if (!STATUS_CHARGING.equalsIgnoreCase(session.getStatus())) {
            throw new RuntimeException("Can only stop sessions with status 'charging'. Current status: " + session.getStatus());
        }
        if (session.getStartedByEmployee() == null) {
            log.warn("Session {} was not started by an employee, but is being stopped by one.", sessionId);
            // Quyết định: Có thể cho dừng hoặc không. Ở đây tôi cho phép dừng.
        }
        if (request.getEndPercentage() < session.getStartPercentage()) {
            throw new RuntimeException("End percentage cannot be less than start percentage");
        }

        // 3. Tính toán thông tin
        LocalDateTime endTime = LocalDateTime.now();
        session.setEndTime(endTime);
        session.setEndPercentage(request.getEndPercentage());
        session.setEndedByEmployee(employee); // Gán nhân viên dừng

        int percentageCharged = request.getEndPercentage() - session.getStartPercentage();
        BigDecimal kwhUsed = KWH_PER_PERCENT.multiply(new BigDecimal(percentageCharged))
                .setScale(2, RoundingMode.HALF_UP);

        // TÍNH GIÁ CƠ BẢN - KHÔNG ÁP DỤNG GIẢM GIÁ CỦA DRIVER
        BigDecimal finalCost = kwhUsed.multiply(COST_PER_KWH)
                .setScale(0, RoundingMode.HALF_UP);

        session.setKwhUsed(kwhUsed);
        session.setCost(finalCost);
        session.setStatus(STATUS_COMPLETED);

        ChargingSession updatedSession = chargingSessionRepository.save(session);

        // 4. Giải phóng charging point
        chargingPointService.stopUsingPoint(session.getChargingPoint().getId());

        log.info("Session {} '{}'. Vehicle {}. Cost: {}",
                sessionId, STATUS_COMPLETED, session.getVehicle().getId(), finalCost);

        return updatedSession;
    }
}
