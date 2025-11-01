package swp391.fa25.swp391.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.ReservationRequest;
import swp391.fa25.swp391.dto.response.ReservationListResponse;
import swp391.fa25.swp391.dto.response.ReservationResponse;
import swp391.fa25.swp391.entity.ChargingPoint;
import swp391.fa25.swp391.entity.Driver;
import swp391.fa25.swp391.entity.Reservation;
import swp391.fa25.swp391.service.IService.IChargingPointService;
import swp391.fa25.swp391.service.IService.IDriverService;
import swp391.fa25.swp391.service.IService.IReservationService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DriverController {
    private final IDriverService driverService;
    private final IChargingPointService chargingPointService;
    private final IReservationService reservationService;

    /**
     * Create reservation (when user clicks reserve button and confirms)
     * Start time is set to NOW, end time is NOW + duration
     * POST /api/drivers/{driverId}/reservations
     */
    @PostMapping("/{driverId}/reservations")
    public ResponseEntity<?> createReservation(
            @PathVariable Integer driverId,
            @Valid @RequestBody ReservationRequest request) {
        try {
            System.out.println("📝 [CREATE RESERVATION] Request received:");
            System.out.println("  - Driver ID: " + driverId);
            System.out.println("  - Charging Point ID: " + request.getChargingPointId());
            System.out.println("  - Duration: " + request.getDurationMinutes());
            
            // Validate driver exists
            Driver driver = validateDriver(driverId);
            System.out.println("✅ [CREATE RESERVATION] Driver validated: " + driver.getId());

            // Validate charging point exists and is available
            ChargingPoint chargingPoint = validateChargingPoint(request.getChargingPointId());
            System.out.println("✅ [CREATE RESERVATION] Charging point found: " + chargingPoint.getId());
            System.out.println("  - Point name: " + chargingPoint.getPointName());
            System.out.println("  - Current status: " + chargingPoint.getStatus());

            // Check if charging point is available
            ResponseEntity<?> availabilityCheck = checkChargingPointAvailability(chargingPoint);
            if (availabilityCheck != null) {
                return availabilityCheck;
            }

            // Create and save reservation
            Reservation savedReservation = createAndSaveReservation(driver, chargingPoint, request);

            // Build response
            ReservationResponse response = buildReservationResponse(savedReservation);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating reservation: " + e.getMessage());
        }
    }

    /**
     * Get all reservations for a driver
     * GET /api/drivers/{driverId}/reservations
     */
    @GetMapping("/{driverId}/reservations")
    public ResponseEntity<?> getDriverReservations(@PathVariable Integer driverId) {
        try {
            List<Reservation> reservations = reservationService.findByUserId(driverId);

            List<ReservationResponse> responseList = reservations.stream()
                    .map(this::buildReservationResponse)
                    .collect(Collectors.toList());

            ReservationListResponse listResponse = ReservationListResponse.builder()
                    .reservations(responseList)
                    .build();

            return ResponseEntity.ok(listResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching reservations: " + e.getMessage());
        }
    }

    /**
     * Cancel a reservation
     * DELETE /api/drivers/reservations/{reservationId}
     */
    @DeleteMapping("/reservations/{reservationId}")
    public ResponseEntity<?> cancelReservation(@PathVariable Integer reservationId) {
        try {
            Reservation reservation = reservationService.findById(reservationId);

            // Validate reservation exists
            if (reservation == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Reservation not found");
            }

            // Validate reservation can be cancelled
            if (!canCancelReservation(reservation)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Can only cancel active reservations");
            }

            // Cancel reservation
            cancelReservationStatus(reservation);

            return ResponseEntity.ok("Reservation cancelled successfully");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error cancelling reservation: " + e.getMessage());
        }
    }

    // ==================== HELPER METHODS ====================

    /**
     * Validate driver exists
     */
    private Driver validateDriver(Integer driverId) {
        return driverService.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
    }

    /**
     * Validate charging point exists
     */
    private ChargingPoint validateChargingPoint(Integer chargingPointId) {
        return chargingPointService.findById(chargingPointId)
                .orElseThrow(() -> new RuntimeException("Charging point not found"));
    }

    /**
     * Check if charging point is available for reservation
     * Returns error response if not available, null if available
     */
    private ResponseEntity<?> checkChargingPointAvailability(ChargingPoint chargingPoint) {
        System.out.println("🔍 [AVAILABILITY CHECK] Checking charging point:");
        System.out.println("  - Point ID: " + chargingPoint.getId());
        System.out.println("  - Point name: " + chargingPoint.getPointName());
        System.out.println("  - Current status: '" + chargingPoint.getStatus() + "'");
        System.out.println("  - Status length: " + (chargingPoint.getStatus() != null ? chargingPoint.getStatus().length() : 0));
        System.out.println("  - Status bytes: " + java.util.Arrays.toString(chargingPoint.getStatus() != null ? chargingPoint.getStatus().getBytes() : new byte[0]));
        
        // CRITICAL FIX: Trim status to handle potential whitespace
        String status = chargingPoint.getStatus();
        if (status != null) {
            status = status.trim();
        }
        
        System.out.println("  - Trimmed status: '" + status + "'");
        System.out.println("  - Status equals 'active': " + "active".equalsIgnoreCase(status));
        
        // Check status - must be "active" (not "inactive" or "using")
        if (!"active".equalsIgnoreCase(status)) {
            System.out.println("❌ [AVAILABILITY CHECK] Status check FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Charging point is not available. Current status: '" + status + "'");
        }
        
        System.out.println("✅ [AVAILABILITY CHECK] Status check PASSED");

        // Check if already reserved
        boolean hasReservation = hasActiveReservation(chargingPoint.getId());
        System.out.println("🔍 [AVAILABILITY CHECK] Has active reservation: " + hasReservation);
        
        if (hasReservation) {
            System.out.println("❌ [AVAILABILITY CHECK] Reservation check FAILED");
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Charging point is currently reserved");
        }
        
        System.out.println("✅ [AVAILABILITY CHECK] All checks PASSED - Point is available");
        return null; // Available
    }

    /**
     * Check if charging point has an active reservation
     */
    private boolean hasActiveReservation(Integer chargingPointId) {
        List<Reservation> reservations = reservationService.findByChargingPointId(chargingPointId);
        LocalDateTime now = LocalDateTime.now();

        return reservations.stream()
                .filter(r -> "ACTIVE".equalsIgnoreCase(r.getStatus()))
                .anyMatch(r -> r.getStartTime().isBefore(now) && r.getEndTime().isAfter(now));
    }

    /**
     * Create and save a new reservation
     */
    private Reservation createAndSaveReservation(Driver driver, ChargingPoint chargingPoint,
                                                 ReservationRequest request) {
        // Calculate time range
        LocalDateTime startTime = LocalDateTime.now();
        LocalDateTime endTime = startTime.plusMinutes(request.getDurationMinutes());

        // Build reservation entity
        Reservation reservation = buildReservationEntity(driver, chargingPoint, startTime, endTime);

        // Save and return
        return reservationService.register(reservation);
    }

    /**
     * Build Reservation entity from components
     */
    private Reservation buildReservationEntity(Driver driver, ChargingPoint chargingPoint,
                                               LocalDateTime startTime, LocalDateTime endTime) {
        Reservation reservation = new Reservation();
        reservation.setDriver(driver);
        reservation.setChargingPoint(chargingPoint);
        reservation.setStartTime(startTime);
        reservation.setEndTime(endTime);
        reservation.setStatus("ACTIVE");
        return reservation;
    }

    /**
     * Build ReservationResponse from Reservation entity
     */
    private ReservationResponse buildReservationResponse(Reservation reservation) {
        ChargingPoint cp = reservation.getChargingPoint();

        return ReservationResponse.builder()
                .reservationId(reservation.getId())
                .startTime(reservation.getStartTime())
                .endTime(reservation.getEndTime())
                .chargingPointName(cp.getPointName())
                .connectorType(cp.getConnectorType())
                .stationName(cp.getStation() != null ? cp.getStation().getStationName() : null)
                .status(reservation.getStatus())
                .build();
    }

    /**
     * Check if reservation can be cancelled
     */
    private boolean canCancelReservation(Reservation reservation) {
        return "ACTIVE".equalsIgnoreCase(reservation.getStatus());
    }

    /**
     * Cancel reservation by updating status
     */
    private void cancelReservationStatus(Reservation reservation) {
        reservation.setStatus("CANCELLED");
        reservationService.register(reservation);
    }
}