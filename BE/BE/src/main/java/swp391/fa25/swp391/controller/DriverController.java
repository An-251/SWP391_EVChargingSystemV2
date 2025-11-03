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
import swp391.fa25.swp391.entity.Vehicle;
import swp391.fa25.swp391.service.IService.IChargingPointService;
import swp391.fa25.swp391.service.IService.IDriverService;
import swp391.fa25.swp391.service.IService.IReservationService;
import swp391.fa25.swp391.service.IService.IVehicleService;

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
    private final IVehicleService vehicleService;

    // Constant for reservation duration
    private static final int RESERVATION_DURATION_MINUTES = 1;

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

            // Validate driver exists
            Driver driver = validateDriver(driverId);

            // Validate charging point exists
            ChargingPoint chargingPoint = validateChargingPoint(request.getChargingPointId());

            // Validate vehicle exists
            Vehicle vehicle = validateVehicle(request.getVehicleId());

            // Validate time slot availability
            ResponseEntity<?> timeValidation = validateReservationTime(request, request.getChargingPointId());
            if (timeValidation != null) {
                return timeValidation;
            }

            // Check if charging point is available
            ResponseEntity<?> availabilityCheck = checkChargingPointAvailability(chargingPoint);
            if (availabilityCheck != null) {
                return availabilityCheck;
            }

            // Create and save reservation
            Reservation savedReservation = createAndSaveReservation(driver, chargingPoint, vehicle, request);

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
            List<Reservation> reservations = reservationService.getReservationsByDriver(driverId.longValue());

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
     * Validate vehicle exists
     */
    private Vehicle validateVehicle(Long vehicleId) {
        return vehicleService.findById(vehicleId.intValue())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
    }

    /**
     * Validate reservation time slot
     */
    private ResponseEntity<?> validateReservationTime(ReservationRequest request, Integer chargingPointId) {
        // Calculate time slot
        LocalDateTime startTime = LocalDateTime.now();
        LocalDateTime endTime = startTime.plusMinutes(RESERVATION_DURATION_MINUTES);

        // Validate overlapping reservations
        if (hasOverlappingReservation(chargingPointId, startTime, endTime)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("This charging point is already reserved for the next hour");
        }

        return null;
    }

    /**
     * Check if charging point is available for reservation
     * Returns error response if not available, null if available
     */
    private ResponseEntity<?> checkChargingPointAvailability(ChargingPoint chargingPoint) {
        String status = chargingPoint.getStatus();
        
        // Check if point can be reserved
        if (!"ACTIVE".equalsIgnoreCase(status)) {
            if ("USING".equalsIgnoreCase(status)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Charging point is currently in use");
            } else if ("MAINTENANCE".equalsIgnoreCase(status)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Charging point is under maintenance");
            } else if ("INACTIVE".equalsIgnoreCase(status)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Charging point is currently inactive");
            } else if ("BOOKED".equalsIgnoreCase(status)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Charging point is already booked");
            }
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
     * Check for overlapping reservations
     */
    private boolean hasOverlappingReservation(Integer chargingPointId, LocalDateTime startTime, LocalDateTime endTime) {
        List<Reservation> reservations = reservationService.findByChargingPointId(chargingPointId);
        
        return reservations.stream()
                .filter(r -> "ACTIVE".equalsIgnoreCase(r.getStatus()))
                .anyMatch(r -> {
                    // Check if new reservation overlaps with existing one
                    return !(endTime.isBefore(r.getStartTime()) || startTime.isAfter(r.getEndTime()));
                });
    }

    /**
     * Create and save a new reservation
     */
    private Reservation createAndSaveReservation(Driver driver, ChargingPoint chargingPoint,
                                                 Vehicle vehicle, ReservationRequest request) {

        LocalDateTime startTime = LocalDateTime.now();
        LocalDateTime endTime = startTime.plusMinutes(RESERVATION_DURATION_MINUTES);

        // Build and save reservation
        Reservation reservation = buildReservationEntity(driver, chargingPoint, vehicle, startTime, endTime);
        Reservation savedReservation = reservationService.register(reservation);

        // Update charging point status to BOOKED
        chargingPoint.setStatus("BOOKED");
        chargingPointService.updateChargingPoint(chargingPoint);

        // Schedule reservation expiry check
        scheduleReservationExpiryCheck(savedReservation, chargingPoint);
        
        return savedReservation;
    }

    /**
     * Build Reservation entity from components
     */
    private Reservation buildReservationEntity(Driver driver, ChargingPoint chargingPoint,
                                               Vehicle vehicle, LocalDateTime startTime, LocalDateTime endTime) {
        Reservation reservation = new Reservation();
        reservation.setDriver(driver);
        reservation.setChargingPoint(chargingPoint);
        reservation.setVehicle(vehicle);
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
        Vehicle vehicle = reservation.getVehicle();

        return ReservationResponse.builder()
                .reservationId(reservation.getId())
                .startTime(reservation.getStartTime())
                .endTime(reservation.getEndTime())
                .chargingPointName(cp.getPointName())
                .connectorType(cp.getConnectorType())
                .stationName(cp.getStation() != null ? cp.getStation().getStationName() : null)
                .status(reservation.getStatus())
                .vehicleId(vehicle != null ? vehicle.getId().longValue() : null)
                .chargingPointId(cp.getId())
                .stationId(cp.getStation() != null ? cp.getStation().getId() : null)
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
        // Update reservation status
        reservation.setStatus("CANCELLED");
        reservationService.register(reservation);

        // Update charging point status back to ACTIVE
        ChargingPoint chargingPoint = reservation.getChargingPoint();
        if (chargingPoint != null && "BOOKED".equalsIgnoreCase(chargingPoint.getStatus())) {
            chargingPoint.setStatus("ACTIVE");
            chargingPointService.updateChargingPoint(chargingPoint);
        }
    }

    /**
     * Schedule a task to check reservation expiry
     */
    private void scheduleReservationExpiryCheck(Reservation reservation, ChargingPoint chargingPoint) {
        // TODO: Implement using Spring's @Scheduled or TaskScheduler
        // This should:
        // 1. Check if reservation is still ACTIVE at end time
        // 2. If yes, mark it as EXPIRED
        // 3. Update charging point status back to ACTIVE if it's still BOOKED
    }

    /**
     * Handle reservation fulfillment (when driver starts charging)
     */
    @PostMapping("/reservations/{reservationId}/fulfill")
    public ResponseEntity<?> fulfillReservation(@PathVariable Integer reservationId) {
        try {
            Reservation reservation = reservationService.findById(reservationId);

            // Validate reservation exists
            if (reservation == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Reservation not found");
            }

            // Validate reservation is active
            if (!"ACTIVE".equalsIgnoreCase(reservation.getStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Only active reservations can be fulfilled");
            }

            // Update reservation status
            reservation.setStatus("FULFILLED");
            reservationService.register(reservation);

            // Charging point status will be updated to USING by the charging session service

            return ResponseEntity.ok("Reservation fulfilled successfully");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fulfilling reservation: " + e.getMessage());
        }
    }
}