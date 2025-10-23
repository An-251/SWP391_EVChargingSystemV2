package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.dto.request.StartChargingSessionRequest;
import swp391.fa25.swp391.dto.request.StopChargingSessionRequest;
import swp391.fa25.swp391.entity.*;
import swp391.fa25.swp391.repository.ChargingSessionRepository;
import swp391.fa25.swp391.service.IService.IChargingPointService;
import swp391.fa25.swp391.service.IService.IChargingSessionService;
import swp391.fa25.swp391.service.IService.IDriverService;
import swp391.fa25.swp391.service.IService.IVehicleService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service xử lý logic cho Charging Session và tạo hóa đơn (Invoice) khi kết thúc sạc.
 * CHỈ TRẢ VỀ ENTITY VÀ KHÔNG BIẾT ĐẾN DTO RESPONSE.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ChargingSessionService implements IChargingSessionService {

    private final ChargingSessionRepository chargingSessionRepository;
    private final IDriverService driverService;
    private final IVehicleService vehicleService;
    private final IChargingPointService chargingPointService;
    private final InvoiceService invoiceService;

    // Hằng số cấu hình
    private static final BigDecimal KWH_PER_PERCENT = new BigDecimal("0.5"); // 0.5 kWh/1%
    private static final BigDecimal COST_PER_KWH = new BigDecimal("3000");   // 3,000 VND/kWh

    // Status constants
    private static final String STATUS_ACTIVE = "active";
    private static final String STATUS_USING = "using";
    private static final String STATUS_INACTIVE = "inactive";

    /**
     * Bắt đầu một phiên sạc mới
     * Tự động chuyển point và station sang status "using"
     */
    @Override
    public ChargingSession startChargingSession(StartChargingSessionRequest request) {
        Driver driver = driverService.findById(request.getDriverId())
                .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + request.getDriverId()));

        // Kiểm tra driver có session đang ACTIVE chưa
        if (chargingSessionRepository.existsByDriverIdAndStatus(request.getDriverId(), "ACTIVE")) {
            throw new RuntimeException("Driver already has an active charging session");
        }

        Vehicle vehicle = vehicleService.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found with ID: " + request.getVehicleId()));

        if (!vehicle.getDriver().getId().equals(request.getDriverId())) {
            throw new RuntimeException("Vehicle does not belong to this driver");
        }

        ChargingPoint chargingPoint = chargingPointService.findById(request.getChargingPointId())
                .orElseThrow(() -> new RuntimeException("Charging point not found with ID: " + request.getChargingPointId()));

        // ✅ Kiểm tra status mới (active/using/inactive)
        if (!STATUS_ACTIVE.equals(chargingPoint.getStatus())) {
            throw new RuntimeException("Charging point must be 'active' to start charging. Current status: " + chargingPoint.getStatus());
        }

        // Kiểm tra trụ sạc có đang sử dụng
        Optional<ChargingSession> pointSession =
                chargingSessionRepository.findActiveSessionByChargingPointId(request.getChargingPointId());
        if (pointSession.isPresent()) {
            throw new RuntimeException("Charging point is currently in use");
        }

        // Kiểm tra station status
        ChargingStation station = chargingPoint.getStation();
        if (station != null && STATUS_INACTIVE.equals(station.getStatus())) {
            throw new RuntimeException("Charging station is inactive");
        }

        // Tạo session mới
        ChargingSession session = new ChargingSession();
        session.setDriver(driver);
        session.setVehicle(vehicle);
        session.setChargingPoint(chargingPoint);
        session.setStartTime(LocalDateTime.now());
        session.setStartPercentage(request.getStartPercentage());
        session.setStatus("ACTIVE");
        session.setKwhUsed(BigDecimal.ZERO);
        session.setCost(BigDecimal.ZERO);
        session.setOverusedTime(BigDecimal.ZERO);

        ChargingSession savedSession = chargingSessionRepository.save(session);

        // ✅ Sử dụng method mới để chuyển point sang "using"
        // Method này tự động propagate sang station
        chargingPointService.startUsingPoint(request.getChargingPointId());

        return savedSession;
    }

    /**
     * Kết thúc một phiên sạc → Tự động sinh hóa đơn
     * Tự động chuyển point về "active" và cập nhật station
     */
    @Override
    public ChargingSession stopChargingSession(Integer sessionId, StopChargingSessionRequest request) {
        ChargingSession session = chargingSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Charging session not found with ID: " + sessionId));

        if (!"ACTIVE".equalsIgnoreCase(session.getStatus())) {
            throw new RuntimeException("Can only stop active sessions");
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

        BigDecimal totalCost = kwhUsed.multiply(COST_PER_KWH)
                .setScale(0, RoundingMode.HALF_UP);

        session.setKwhUsed(kwhUsed);
        session.setCost(totalCost);
        session.setStatus("COMPLETED");

        ChargingSession updatedSession = chargingSessionRepository.save(session);

        // ✅ Sử dụng method mới để chuyển point về "active"
        // Method này tự động cập nhật station nếu không còn point nào "using"
        ChargingPoint chargingPoint = session.getChargingPoint();
        chargingPointService.stopUsingPoint(chargingPoint.getId());

        // Tạo hóa đơn
        Invoice invoice = new Invoice();
        invoice.setIssueDate(Instant.now());
        invoice.setTotalCost(totalCost);
        invoice.setPaymentMethod("CASH");
        invoice.setStatus("PAID");
        invoice.setDriver(session.getDriver());
        invoice.setSession(session);

        invoiceService.save(invoice);

        return updatedSession;
    }

    /**
     * Hủy session sạc
     * Tự động giải phóng point và cập nhật station
     */
    @Override
    public void cancelChargingSession(Integer sessionId) {
        ChargingSession session = chargingSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Charging session not found with ID: " + sessionId));

        if (!"ACTIVE".equalsIgnoreCase(session.getStatus())) {
            throw new RuntimeException("Can only cancel active sessions");
        }

        session.setStatus("CANCELLED");
        session.setEndTime(LocalDateTime.now());
        chargingSessionRepository.save(session);

        // ✅ Sử dụng method mới để giải phóng point
        ChargingPoint chargingPoint = session.getChargingPoint();
        chargingPointService.stopUsingPoint(chargingPoint.getId());
    }

    // ======= Các method hỗ trợ (CHỈ TRẢ VỀ ENTITY) =======

    @Override
    @Transactional(readOnly = true)
    public Optional<ChargingSession> findById(Integer id) {
        return chargingSessionRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public ChargingSession getSessionById(Integer id) {
        return chargingSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Charging session not found with ID: " + id));
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