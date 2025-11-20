package swp391.fa25.swp391.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.StartChargingSessionRequest;
import swp391.fa25.swp391.dto.request.StopChargingSessionRequest;
import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.dto.response.ChargingSessionListResponse;
import swp391.fa25.swp391.dto.response.ChargingSessionResponse;
import swp391.fa25.swp391.entity.Charger;
import swp391.fa25.swp391.entity.ChargingPoint;
import swp391.fa25.swp391.entity.ChargingSession;
import swp391.fa25.swp391.entity.PlanRegistration;
import swp391.fa25.swp391.entity.Reservation;
import swp391.fa25.swp391.repository.ChargingSessionRepository;
import swp391.fa25.swp391.repository.PlanRegistrationRepository;
import swp391.fa25.swp391.service.ChargingSessionService;
import swp391.fa25.swp391.service.IService.IChargingSessionService;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * REST Controller cho ChargingSession
 * Quản lý các API liên quan đến phiên sạc và MAPPING ENTITY SANG DTO
 */
@RestController
@RequestMapping("/api/charging-sessions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChargingSessionController {

    private final ChargingSessionService chargingSessionService;
    private final ChargingSessionRepository chargingSessionRepository;
    private final PlanRegistrationRepository planRegistrationRepository;

    // ============================================
    // SESSION MANAGEMENT APIs
    // ============================================

    /**
     * Bắt đầu phiên sạc
     */
    @PostMapping("/start")
    public ResponseEntity<?> startChargingSession(
            @Valid @RequestBody StartChargingSessionRequest request) {
        try {

            ChargingSession session = chargingSessionService.startChargingSession(request);

            // ⬅️ Controller (hoặc Mapper) chuyển đổi Entity sang DTO Response
            ChargingSessionResponse response = mapToResponse(session);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Charging session started successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error starting charging session: " + e.getMessage()));
        }
    }

    /**
     * Dừng phiên sạc
     */
    @PostMapping("/{sessionId}/stop")
    public ResponseEntity<?> stopChargingSession(
            @PathVariable Integer sessionId,
            @Valid @RequestBody StopChargingSessionRequest request) {
        try {
            // ⬅️ Service trả về Entity
            ChargingSession session =
                    chargingSessionService.stopChargingSession(sessionId, request);

            // ⬅️ Controller (hoặc Mapper) chuyển đổi Entity sang DTO Response
            ChargingSessionResponse response = mapToResponse(session);

            return ResponseEntity.ok(
                    ApiResponse.success("Charging session completed successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error stopping charging session: " + e.getMessage()));
        }
    }

    /**
     * ⭐ NEW: Emergency stop - Dừng khẩn cấp với tính tiền và gửi incident
     * POST /api/charging-sessions/{sessionId}/emergency-stop
     */
    @PostMapping("/{sessionId}/emergency-stop")
    public ResponseEntity<?> emergencyStopChargingSession(
            @PathVariable Integer sessionId,
            @Valid @RequestBody StopChargingSessionRequest request) {
        try {
            // Service xử lý tính tiền và gửi incident report
            ChargingSession session =
                    chargingSessionService.emergencyStopChargingSession(sessionId, request);

            // Chuyển đổi Entity sang DTO Response
            ChargingSessionResponse response = mapToResponse(session);

            return ResponseEntity.ok(
                    ApiResponse.success("⚠️ Emergency stop successful. Incident report sent to employees.", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error during emergency stop: " + e.getMessage()));
        }
    }

    /**
     * Hủy phiên sạc (cancel without charging - old method)
     */
    @DeleteMapping("/{sessionId}")
    public ResponseEntity<?> cancelChargingSession(@PathVariable Integer sessionId) {
        try {
            // Service chỉ thực hiện logic, không cần trả về DTO
            chargingSessionService.cancelChargingSession(sessionId);
            return ResponseEntity.ok(
                    ApiResponse.success("Charging session cancelled successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error cancelling session: " + e.getMessage()));
        }
    }

    // ============================================
    // QUERY APIs
    // ============================================

    /**
     * Lấy tất cả charging sessions (cho admin dashboard)
     */
    @GetMapping
    public ResponseEntity<?> getAllSessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        try {
            if (size <= 0 || size > 1000) {
                size = 100;
            }

            Pageable pageable = PageRequest.of(page, size);
            Page<ChargingSession> sessionPage = chargingSessionRepository.findAll(pageable);

            List<ChargingSessionResponse> responses = sessionPage.getContent().stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());

            ChargingSessionListResponse listResponse = ChargingSessionListResponse.builder()
                    .sessions(responses)
                    .totalSessions((int) sessionPage.getTotalElements())
                    .build();

            return ResponseEntity.ok(ApiResponse.success("All sessions retrieved successfully", listResponse));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching sessions: " + e.getMessage()));
        }
    }

    /**
     * Lấy thông tin chi tiết một session
     */
    @GetMapping("/{sessionId}")
    public ResponseEntity<?> getSessionById(@PathVariable Integer sessionId) {
        try {
            // ⬅️ Service trả về Entity
            ChargingSession session = chargingSessionService.getSessionById(sessionId);

            // ⬅️ Controller (hoặc Mapper) chuyển đổi Entity sang DTO Response
            ChargingSessionResponse response = mapToResponse(session);

            return ResponseEntity.ok(ApiResponse.success("Session retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving session: " + e.getMessage()));
        }
    }

    /**
     * Lấy session đang ACTIVE của driver
     */
    @GetMapping("/driver/{driverId}/active")
    public ResponseEntity<?> getActiveSession(@PathVariable Integer driverId) {
        try {
            //  Service trả về Optional<Entity>
            Optional<ChargingSession> session =
                    chargingSessionService.findActiveSessionByDriverId(driverId);

            if (session.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("No active charging session found"));
            }

            //  Controller (hoặc Mapper) chuyển đổi Entity sang DTO Response
            ChargingSessionResponse response = mapToResponse(session.get());
            return ResponseEntity.ok(ApiResponse.success("Active session retrieved", response));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching active session: " + e.getMessage()));
        }
    }
    @GetMapping("/active")
    public ResponseEntity<?> getAllActiveSessions() {
        try {
            //  Service trả về List<Entity> - Session đang sạc = using
            List<ChargingSession> sessions = chargingSessionService.findByStatus("using");

            // Controller (hoặc Mapper) chuyển đổi Entity List sang DTO Response List
            List<ChargingSessionResponse> responses = sessions.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());

            ChargingSessionListResponse listResponse = ChargingSessionListResponse.builder()
                    .sessions(responses)
                    .totalSessions(responses.size())
                    .build();

            return ResponseEntity.ok(ApiResponse.success("All active sessions retrieved", listResponse));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching active sessions: " + e.getMessage()));
        }
    }
    /**
     * Lấy tất cả sessions của driver (có pagination)
     */
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<?> getDriverSessions(
            @PathVariable Integer driverId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            if (size <= 0 || size > 100) {
                size = 10;
            }

            Pageable pageable = PageRequest.of(page, size);
            // ⬅️ Service trả về Page<Entity>
            Page<ChargingSession> sessionPage =
                    chargingSessionService.findByDriverId(driverId, pageable);

            // ⬅️ Controller (hoặc Mapper) chuyển đổi Entity List sang DTO Response List
            List<ChargingSessionResponse> responses = sessionPage.getContent().stream()
                    .map(this::mapToResponse) // Sử dụng helper method của Controller
                    .collect(Collectors.toList());

            ChargingSessionListResponse listResponse = ChargingSessionListResponse.builder()
                    .sessions(responses)
                    .totalSessions((int) sessionPage.getTotalElements())
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Sessions retrieved successfully", listResponse));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching sessions: " + e.getMessage()));
        }
    }

    /**
     * Lấy tất cả sessions của driver (không pagination)
     */
    @GetMapping("/driver/{driverId}/all")
    public ResponseEntity<?> getAllDriverSessions(@PathVariable Integer driverId) {
        try {
            // ⬅️ Service trả về List<Entity>
            List<ChargingSession> sessions = chargingSessionService.findByDriverId(driverId);

            // ⬅️ Controller (hoặc Mapper) chuyển đổi Entity List sang DTO Response List
            List<ChargingSessionResponse> responses = sessions.stream()
                    .map(this::mapToResponse) // Sử dụng helper method của Controller
                    .collect(Collectors.toList());

            ChargingSessionListResponse listResponse = ChargingSessionListResponse.builder()
                    .sessions(responses)
                    .totalSessions(responses.size())
                    .build();

            return ResponseEntity.ok(ApiResponse.success("All sessions retrieved", listResponse));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching all sessions: " + e.getMessage()));
        }
    }

    /**
     * Lấy sessions theo status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getSessionsByStatus(@PathVariable String status) {
        try {
            // ⬅️ Service trả về List<Entity>
            List<ChargingSession> sessions = chargingSessionService.findByStatus(status);

            // ⬅️ Controller (hoặc Mapper) chuyển đổi Entity List sang DTO Response List
            List<ChargingSessionResponse> responses = sessions.stream()
                    .map(this::mapToResponse) // Sử dụng helper method của Controller
                    .collect(Collectors.toList());

            ChargingSessionListResponse listResponse = ChargingSessionListResponse.builder()
                    .sessions(responses)
                    .totalSessions(responses.size())
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Sessions retrieved by status", listResponse));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching sessions by status: " + e.getMessage()));
        }
    }

    // ============================================
    // STATISTICS APIs (Không thay đổi vì Service đã trả về kiểu dữ liệu cơ bản)
    // ============================================

    /**
     * Lấy tổng chi phí của driver
     */
    @GetMapping("/driver/{driverId}/total-cost")
    public ResponseEntity<?> getTotalCostByDriver(@PathVariable Integer driverId) {
        try {
            var totalCost = chargingSessionService.calculateTotalCostByDriver(driverId);
            return ResponseEntity.ok(ApiResponse.success("Total cost calculated", totalCost));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error calculating total cost: " + e.getMessage()));
        }
    }

    /**
     * Đếm số sessions theo status
     */
    @GetMapping("/count")
    public ResponseEntity<?> countByStatus(@RequestParam String status) {
        try {
            Long count = chargingSessionService.countByStatus(status);
            return ResponseEntity.ok(ApiResponse.success("Count retrieved", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error counting sessions: " + e.getMessage()));
        }
    }
    //=========
    @PostMapping("/{sessionId}/fail")
    public ResponseEntity<?> failChargingSession(
            @PathVariable Integer sessionId,
            @RequestParam(required = false) String reason) {
        try {
            chargingSessionService.failChargingSession(sessionId, reason);
            return ResponseEntity.ok(
                    ApiResponse.success("Session marked as FAILED: " + (reason != null ? reason : "Unknown")));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error marking session as failed: " + e.getMessage()));
        }
    }

    /**
     * Đánh dấu session bị gián đoạn (dùng khi mất kết nối đột ngột)
     */
    @PostMapping("/{sessionId}/interrupt")
    public ResponseEntity<?> interruptChargingSession(@PathVariable Integer sessionId) {
        try {
            chargingSessionService.interruptChargingSession(sessionId);
            return ResponseEntity.ok(
                    ApiResponse.success("Session marked as INTERRUPTED"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error marking session as interrupted: " + e.getMessage()));
        }
    }

    // API timeoutChargingSession đã bị loại bỏ

    /**
     * Lấy thống kê sessions theo status
     */
    @GetMapping("/statistics/by-status")
    public ResponseEntity<?> getSessionStatisticsByStatus() {
        try {
            Map<String, Long> statistics = new HashMap<>();

            statistics.put("charging", chargingSessionService.countByStatus("charging"));
            statistics.put("completed", chargingSessionService.countByStatus("completed"));
            statistics.put("cancelled", chargingSessionService.countByStatus("cancelled"));
            statistics.put("failed", chargingSessionService.countByStatus("failed"));
            statistics.put("interrupted", chargingSessionService.countByStatus("interrupted"));

            return ResponseEntity.ok(ApiResponse.success("Statistics retrieved", statistics));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving statistics: " + e.getMessage()));
        }
    }

    /**
     * Lấy danh sách sessions có vấn đề (failed, interrupted)
     */
    @GetMapping("/problematic")
    public ResponseEntity<?> getProblematicSessions() {
        try {
            List<ChargingSession> problematicSessions = new ArrayList<>();

            problematicSessions.addAll(chargingSessionService.findByStatus("failed"));
            problematicSessions.addAll(chargingSessionService.findByStatus("interrupted"));

            // Sort by start time descending
            problematicSessions.sort((s1, s2) ->
                    s2.getStartTime().compareTo(s1.getStartTime()));

            List<ChargingSessionResponse> responses = problematicSessions.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());

            ChargingSessionListResponse listResponse = ChargingSessionListResponse.builder()
                    .sessions(responses)
                    .totalSessions(responses.size())
                    .build();

            return ResponseEntity.ok(ApiResponse.success(
                    "Problematic sessions retrieved", listResponse));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving problematic sessions: " + e.getMessage()));
        }
    }
    
    // ============================================
    // EMPLOYEE MONITORING APIs
    // ============================================
    
    /**
     * Get all charging sessions by facility (for Employee monitoring)
     * GET /api/charging-sessions/facility/{facilityId}
     */
    @GetMapping("/facility/{facilityId}")
    public ResponseEntity<ApiResponse> getSessionsByFacility(
            @PathVariable Integer facilityId,
            @RequestParam(required = false) String status) {
        try {
            System.out.println("🔍 Fetching charging sessions for facility ID: " + facilityId);
            
            List<ChargingSession> allSessions = chargingSessionRepository.findAll();
            
            // Filter sessions by facility through Charger -> ChargingPoint -> Station -> Facility
            List<ChargingSession> facilitySessions = allSessions.stream()
                    .filter(session -> {
                        if (session.getCharger() == null) return false;
                        ChargingPoint point = session.getCharger().getChargingPoint();
                        if (point == null || point.getStation() == null) return false;
                        if (point.getStation().getFacility() == null) return false;
                        return point.getStation().getFacility().getId().equals(facilityId);
                    })
                    .collect(Collectors.toList());
            
            // Filter by status if provided
            if (status != null && !status.isEmpty()) {
                facilitySessions = facilitySessions.stream()
                        .filter(s -> status.equalsIgnoreCase(s.getStatus()))
                        .collect(Collectors.toList());
            }
            
            // Sort by start time descending (newest first)
            facilitySessions.sort((s1, s2) -> s2.getStartTime().compareTo(s1.getStartTime()));
            
            List<ChargingSessionResponse> responses = facilitySessions.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
            
            System.out.println("✅ Found " + responses.size() + " sessions for facility " + facilityId);
            return ResponseEntity.ok(ApiResponse.success(
                    "Retrieved " + responses.size() + " sessions for facility", 
                    responses
            ));
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching sessions by facility: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving sessions by facility: " + e.getMessage()));
        }
    }
    
    /**
     * Get session statistics by facility (for Employee dashboard)
     * GET /api/charging-sessions/facility/{facilityId}/statistics
     */
    @GetMapping("/facility/{facilityId}/statistics")
    public ResponseEntity<ApiResponse> getFacilityStatistics(
            @PathVariable Integer facilityId) {
        try {
            List<ChargingSession> allSessions = chargingSessionRepository.findAll();
            
            // Filter by facility
            List<ChargingSession> facilitySessions = allSessions.stream()
                    .filter(session -> {
                        if (session.getCharger() == null) return false;
                        ChargingPoint point = session.getCharger().getChargingPoint();
                        if (point == null || point.getStation() == null) return false;
                        if (point.getStation().getFacility() == null) return false;
                        return point.getStation().getFacility().getId().equals(facilityId);
                    })
                    .collect(Collectors.toList());
            
            // Calculate statistics
            long activeCount = facilitySessions.stream()
                    .filter(s -> "charging".equalsIgnoreCase(s.getStatus()))
                    .count();
            
            long completedToday = facilitySessions.stream()
                    .filter(s -> "completed".equalsIgnoreCase(s.getStatus()))
                    .filter(s -> s.getEndTime() != null && 
                            s.getEndTime().toLocalDate().equals(LocalDate.now()))
                    .count();
            
            double totalEnergyToday = facilitySessions.stream()
                    .filter(s -> "completed".equalsIgnoreCase(s.getStatus()))
                    .filter(s -> s.getEndTime() != null && 
                            s.getEndTime().toLocalDate().equals(LocalDate.now()))
                    .mapToDouble(s -> s.getKwhUsed() != null ? 
                            s.getKwhUsed().doubleValue() : 0.0)
                    .sum();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("activeSessions", activeCount);
            stats.put("completedToday", completedToday);
            stats.put("totalEnergyToday", totalEnergyToday);
            stats.put("totalSessions", facilitySessions.size());
            
            return ResponseEntity.ok(ApiResponse.success("Facility statistics retrieved", stats));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving facility statistics: " + e.getMessage()));
        }
    }
    
    // ============================================
    // HEALTH CHECK
    // ============================================

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("ChargingSession API is running"));
    }

    // ============================================
    // HELPER METHODS (MAPPING ENTITY -> DTO)
    // ============================================

    /**
     * Helper method để chuyển đổi ChargingSession Entity sang ChargingSessionResponse DTO
     * (Logic này được di chuyển từ Service sang Controller/Mapper)
     */
    private ChargingSessionResponse mapToResponse(ChargingSession session) {
        Long durationMinutes = null;
        Integer chargedPercentage = null;

        if (session.getEndTime() != null) {
            durationMinutes = Duration.between(session.getStartTime(), session.getEndTime()).toMinutes();
        }

        if (session.getEndPercentage() != null && session.getStartPercentage() != null) {
            chargedPercentage = session.getEndPercentage() - session.getStartPercentage();
        }

        Charger charger = session.getCharger();
        ChargingPoint cp = charger != null ? charger.getChargingPoint() : null;

        // ✅ LẤY THÔNG TIN RESERVATION (CHỈ HỖ TRỢ RESERVATION)
        Reservation reservation = session.getReservation();
        Long reservationId = null;
        String chargingType = "RESERVATION"; // Chỉ hỗ trợ sạc qua đặt chỗ
        LocalDateTime reservationStartTime = null;
        LocalDateTime reservationEndTime = null;

        if (reservation != null) {
            reservationId = reservation.getId();
            reservationStartTime = reservation.getStartTime();
            reservationEndTime = reservation.getEndTime();
        }

        // ⭐ TÍNH TOÁN COST BREAKDOWN CHO FE HIỂN THỊ
        BigDecimal pricePerKwh = cp != null ? cp.getPricePerKwh() : BigDecimal.ZERO;
        BigDecimal kwhUsed = session.getKwhUsed() != null ? session.getKwhUsed() : BigDecimal.ZERO;
        BigDecimal startFee = session.getStartFee() != null ? session.getStartFee() : BigDecimal.ZERO;
        BigDecimal overusePenalty = session.getOverusePenalty() != null ? session.getOverusePenalty() : BigDecimal.ZERO;
        
        // Tính chi phí điện năng TRƯỚC giảm giá
        BigDecimal energyCostBeforeDiscount = kwhUsed.multiply(pricePerKwh);
        
        // Lấy thông tin subscription discount
        String subscriptionPlanName = null;
        BigDecimal discountRate = BigDecimal.ZERO;
        BigDecimal energyCostAfterDiscount = energyCostBeforeDiscount; // Mặc định không có discount
        
        Optional<PlanRegistration> activePlan = planRegistrationRepository
                .findActiveByDriverId(session.getDriver().getId(), LocalDate.now());
        
        if (activePlan.isPresent()) {
            PlanRegistration planReg = activePlan.get();
            subscriptionPlanName = planReg.getPlan().getPlanName();
            discountRate = planReg.getPlan().getDiscountRate() != null 
                ? planReg.getPlan().getDiscountRate() 
                : BigDecimal.ZERO;
            
            // Tính chi phí điện năng SAU giảm giá
            // Formula: energyCostAfterDiscount = energyCostBeforeDiscount - (energyCostBeforeDiscount * discountRate / 100)
            BigDecimal discountAmount = energyCostBeforeDiscount
                    .multiply(discountRate)
                    .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
            energyCostAfterDiscount = energyCostBeforeDiscount.subtract(discountAmount);
        }

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
                .vehicleModel(session.getVehicle().getModel())
                .licensePlate(session.getVehicle().getLicensePlate())
                .chargerId(charger != null ? charger.getId() : null)
                .chargerCode(charger != null ? charger.getChargerCode() : null)
                .connectorType(charger != null ? charger.getConnectorType() : null)
                .chargingPointId(cp != null ? cp.getId() : null)
                .chargingPointName(cp != null ? cp.getPointName() : null)
                .stationId(cp != null && cp.getStation() != null ? cp.getStation().getId() : null)
                .stationName(cp != null && cp.getStation() != null ? cp.getStation().getStationName() : null)
                .stationAddress(cp != null && cp.getStation() != null ? cp.getStation().getFacility().getFullAddress() : null)
                .facilityId(cp != null && cp.getStation() != null && cp.getStation().getFacility() != null ? 
                        cp.getStation().getFacility().getId() : null)
                .facilityName(cp != null && cp.getStation() != null && cp.getStation().getFacility() != null ? 
                        cp.getStation().getFacility().getName() : null)
                .startPercentage(session.getStartPercentage())
                .endPercentage(session.getEndPercentage())
                .chargedPercentage(chargedPercentage)
                .kwhUsed(kwhUsed)
                .pricePerKwh(pricePerKwh)
                
                // ⭐ Cost breakdown
                .startFee(startFee)
                .energyCostBeforeDiscount(energyCostBeforeDiscount)
                .energyCostAfterDiscount(energyCostAfterDiscount)
                .overusePenalty(overusePenalty)
                .cost(session.getCost())
                
                // ⭐ Subscription info
                .subscriptionPlanName(subscriptionPlanName)
                .discountRate(discountRate)

                .reservationId(reservationId)
                .chargingType(chargingType)
                .reservationStartTime(reservationStartTime)
                .reservationEndTime(reservationEndTime)
                .build();
    }
}