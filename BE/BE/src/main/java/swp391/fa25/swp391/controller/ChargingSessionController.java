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
import swp391.fa25.swp391.entity.ChargingPoint;
import swp391.fa25.swp391.entity.ChargingSession;
import swp391.fa25.swp391.service.IService.IChargingSessionService;

import java.time.Duration;
import java.util.List;
import java.util.Optional;
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

    private final IChargingSessionService chargingSessionService;

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
     * Hủy phiên sạc (emergency stop)
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
            //  Service trả về List<Entity>
            List<ChargingSession> sessions = chargingSessionService.findByStatus("ACTIVE");

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

        // Đảm bảo các Entity liên quan (ChargingPoint, Driver, Vehicle) đã được fetch
        // (Đây là lý do logic này thường được đặt trong Mapper độc lập hoặc Controller)
        ChargingPoint cp = session.getChargingPoint();

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