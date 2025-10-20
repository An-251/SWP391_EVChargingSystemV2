package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.dto.request.StartChargingSessionRequest;
import swp391.fa25.swp391.dto.request.StopChargingSessionRequest;
import swp391.fa25.swp391.dto.response.ChargingSessionResponse;
import swp391.fa25.swp391.entity.*;
import swp391.fa25.swp391.repository.ChargingSessionRepository;
import swp391.fa25.swp391.service.IService.IChargingPointService;
import swp391.fa25.swp391.service.IService.IChargingSessionService;
import swp391.fa25.swp391.service.IService.IDriverService;
import swp391.fa25.swp391.service.IService.IVehicleService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service xử lý logic cho Charging Session và tạo hóa đơn (Invoice) khi kết thúc sạc.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ChargingSessionService implements IChargingSessionService {

    private final ChargingSessionRepository chargingSessionRepository;
    private final IDriverService driverService;
    private final IVehicleService vehicleService;
    private final IChargingPointService chargingPointService;
    private final InvoiceService invoiceService; // ✅ Tự động tạo hóa đơn

    // Hằng số cấu hình
    private static final BigDecimal KWH_PER_PERCENT = new BigDecimal("0.5"); // 0.5 kWh/1%
    private static final BigDecimal COST_PER_KWH = new BigDecimal("3000");   // 3,000 VND/kWh

    /**
     * Bắt đầu một phiên sạc mới
     */
    @Override
    public ChargingSessionResponse startChargingSession(StartChargingSessionRequest request) {
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
        if (!"AVAILABLE".equalsIgnoreCase(chargingPoint.getStatus())) {
            throw new RuntimeException("Charging point is not available");
        }

        // Kiểm tra trụ sạc có đang sử dụng
        Optional<ChargingSession> pointSession =
                chargingSessionRepository.findActiveSessionByChargingPointId(request.getChargingPointId());
        if (pointSession.isPresent()) {
            throw new RuntimeException("Charging point is currently in use");
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

        // Cập nhật trạng thái trụ sạc
        chargingPoint.setStatus("IN_USE");
        chargingPointService.save(chargingPoint);

        return buildResponse(savedSession);
    }

    /**
     * Kết thúc một phiên sạc → Tự động sinh hóa đơn
     */
    @Override
    public ChargingSessionResponse stopChargingSession(Integer sessionId, StopChargingSessionRequest request) {
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

        // ✅ Giải phóng trụ sạc
        ChargingPoint chargingPoint = session.getChargingPoint();
        chargingPoint.setStatus("AVAILABLE");
        chargingPointService.save(chargingPoint);

        // ✅ Tạo hóa đơn khi hoàn thành
// Generate invoice ID manually (Invoice entity không có @GeneratedValue)
        Integer nextInvoiceId = generateNextInvoiceId();

        Invoice invoice = new Invoice();
        invoice.setId(nextInvoiceId); // ✅ FIX: Set ID thủ công
        invoice.setIssueDate(Instant.now());
        invoice.setTotalCost(totalCost);
        invoice.setPaymentMethod("CASH"); // Có thể thay bằng "VNPAY" hoặc "BANK_TRANSFER"
        invoice.setStatus("PAID");        // Hoặc "UNPAID" nếu cần xác nhận
        invoice.setDriver(session.getDriver());
        invoice.setSession(session);

        invoiceService.save(invoice);

        return buildResponse(updatedSession);
    }

    /**
     * Hủy session sạc
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

        ChargingPoint chargingPoint = session.getChargingPoint();
        chargingPoint.setStatus("AVAILABLE");
        chargingPointService.save(chargingPoint);
    }

    // ======= Các method hỗ trợ =======

    @Override
    @Transactional(readOnly = true)
    public Optional<ChargingSession> findById(Integer id) {
        return chargingSessionRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public ChargingSessionResponse getSessionById(Integer id) {
        ChargingSession session = chargingSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Charging session not found with ID: " + id));
        return buildResponse(session);
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

    // ======= Helper =======

    /**
     * Generate next Invoice ID manually (vì Invoice entity thiếu @GeneratedValue)
     */
    private Integer generateNextInvoiceId() {
        // Lấy invoice có ID lớn nhất từ database
        List<Invoice> allInvoices = invoiceService.findAll();
        if (allInvoices.isEmpty()) {
            return 1; // First invoice
        }

        // Tìm ID lớn nhất
        Integer maxId = allInvoices.stream()
                .map(Invoice::getId)
                .max(Integer::compareTo)
                .orElse(0);

        return maxId + 1;
    }

    private ChargingSessionResponse buildResponse(ChargingSession session) {
        Long durationMinutes = null;
        Integer chargedPercentage = null;

        if (session.getEndTime() != null) {
            durationMinutes = Duration.between(session.getStartTime(), session.getEndTime()).toMinutes();
        }

        if (session.getEndPercentage() != null && session.getStartPercentage() != null) {
            chargedPercentage = session.getEndPercentage() - session.getStartPercentage();
        }

        ChargingPoint cp = session.getChargingPoint();

        // Build vehicle name from model and licensePlate
        String vehicleName = String.format("%s (%s)",
                session.getVehicle().getModel() != null ? session.getVehicle().getModel() : "Unknown",
                session.getVehicle().getLicensePlate() != null ? session.getVehicle().getLicensePlate() : "No Plate"
        );

        return ChargingSessionResponse.builder()
                .sessionId(session.getId())
                .status(session.getStatus())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .durationMinutes(durationMinutes)
                .overusedTime(session.getOverusedTime())
                .driverId(session.getDriver().getId())
                .driverName(session.getDriver().getAccount().getFullName())
                .vehicleId(session.getVehicle().getId())
                .vehicleName(vehicleName) // ✅ FIX: Add vehicle name
                .vehicleModel(session.getVehicle().getModel())
                .licensePlate(session.getVehicle().getLicensePlate())
                .chargingPointId(cp.getId())
                .chargingPointName(cp.getPointName())
                .connectorType(cp.getConnectorType())
                .stationName(cp.getStation() != null ? cp.getStation().getStationName() : null)
                .stationAddress(cp.getStation() != null ? cp.getStation().getFacility().getFullAddress() : null)
                .startPercentage(session.getStartPercentage())
                .endPercentage(session.getEndPercentage())
                .chargedPercentage(chargedPercentage)
                .kwhUsed(session.getKwhUsed())
                .cost(session.getCost())
                .build();
    }
}