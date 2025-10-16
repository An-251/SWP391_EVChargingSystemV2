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
import swp391.fa25.swp391.entity.ChargingSession;
import swp391.fa25.swp391.service.IService.IChargingSessionService;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST Controller cho ChargingSession
 * Quản lý các API liên quan đến phiên sạc
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
     * POST /api/charging-sessions/start
     *
     * Request body:
     * {
     *   "driverId": 1,
     *   "chargingPointId": 5,
     *   "vehicleId": 2,
     *   "startPercentage": 20
     * }
     */
    @PostMapping("/start")
    public ResponseEntity<?> startChargingSession(
            @Valid @RequestBody StartChargingSessionRequest request) {
        try {
            ChargingSessionResponse response = chargingSessionService.startChargingSession(request);
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
     * POST /api/charging-sessions/{sessionId}/stop
     *
     * Request body:
     * {
     *   "endPercentage": 80
     * }
     */
    @PostMapping("/{sessionId}/stop")
    public ResponseEntity<?> stopChargingSession(
            @PathVariable Integer sessionId,
            @Valid @RequestBody StopChargingSessionRequest request) {
        try {
            ChargingSessionResponse response =
                    chargingSessionService.stopChargingSession(sessionId, request);
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
     * DELETE /api/charging-sessions/{sessionId}
     */
    @DeleteMapping("/{sessionId}")
    public ResponseEntity<?> cancelChargingSession(@PathVariable Integer sessionId) {
        try {
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
     * GET /api/charging-sessions/{sessionId}
     */
    @GetMapping("/{sessionId}")
    public ResponseEntity<?> getSessionById(@PathVariable Integer sessionId) {
        try {
            ChargingSessionResponse response = chargingSessionService.getSessionById(sessionId);
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
     * GET /api/charging-sessions/driver/{driverId}/active
     */
    @GetMapping("/driver/{driverId}/active")
    public ResponseEntity<?> getActiveSession(@PathVariable Integer driverId) {
        try {
            Optional<ChargingSession> session =
                    chargingSessionService.findActiveSessionByDriverId(driverId);

            if (session.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("No active charging session found"));
            }

            ChargingSessionResponse response = chargingSessionService.getSessionById(session.get().getId());
            return ResponseEntity.ok(ApiResponse.success("Active session retrieved", response));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching active session: " + e.getMessage()));
        }
    }

    /**
     * Lấy tất cả sessions của driver (có pagination)
     * GET /api/charging-sessions/driver/{driverId}?page=0&size=10
     */
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<?> getDriverSessions(
            @PathVariable Integer driverId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            if (size <= 0 || size > 100) {
                size = 10; // Default và max size
            }

            Pageable pageable = PageRequest.of(page, size);
            Page<ChargingSession> sessionPage =
                    chargingSessionService.findByDriverId(driverId, pageable);

            List<ChargingSessionResponse> responses = sessionPage.getContent().stream()
                    .map(session -> chargingSessionService.getSessionById(session.getId()))
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
     * GET /api/charging-sessions/driver/{driverId}/all
     */
    @GetMapping("/driver/{driverId}/all")
    public ResponseEntity<?> getAllDriverSessions(@PathVariable Integer driverId) {
        try {
            List<ChargingSession> sessions = chargingSessionService.findByDriverId(driverId);

            List<ChargingSessionResponse> responses = sessions.stream()
                    .map(session -> chargingSessionService.getSessionById(session.getId()))
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
     * GET /api/charging-sessions/status/{status}
     * status: ACTIVE, COMPLETED, CANCELLED
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getSessionsByStatus(@PathVariable String status) {
        try {
            List<ChargingSession> sessions = chargingSessionService.findByStatus(status);

            List<ChargingSessionResponse> responses = sessions.stream()
                    .map(session -> chargingSessionService.getSessionById(session.getId()))
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
    // STATISTICS APIs
    // ============================================

    /**
     * Lấy tổng chi phí của driver
     * GET /api/charging-sessions/driver/{driverId}/total-cost
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
     * GET /api/charging-sessions/count?status=COMPLETED
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
     * GET /api/charging-sessions/health
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("ChargingSession API is running"));
    }
}