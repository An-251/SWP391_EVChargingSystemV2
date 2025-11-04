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
import swp391.fa25.swp391.service.ReservationService;
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
    private final ReservationService reservationService; //  Đổi từ Interface sang concrete class
    private final IVehicleService vehicleService;

    // Constant for reservation duration
    private static final int RESERVATION_DURATION_MINUTES = 1;
    
    // Status Constants - CHỈ ĐỌC, KHÔNG ĐƯỢC DÙNG ĐỂ SET STATUS
    private static final String STATUS_ACTIVE = "active";
    private static final String STATUS_USING = "using";
    private static final String STATUS_MAINTENANCE = "maintenance";
    private static final String STATUS_INACTIVE = "inactive";
    private static final String STATUS_BOOKED = "booked";
    private static final String STATUS_FULFILLED = "fulfilled";
    private static final String STATUS_CANCELLED = "cancelled";

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

            // FIX: Gọi createReservation() từ service (service tự update charging point)
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
    public ResponseEntity<?> cancelReservation(
            @PathVariable Integer reservationId,
            @RequestParam Integer driverId) { // ⭐ Thêm driverId để validate
        try {
            // FIX: Gọi cancelReservation() từ service (service tự nhả charging point)
            Reservation cancelledReservation = reservationService.cancelReservation(
                    reservationId.longValue(), 
                    driverId.longValue()
            );

            return ResponseEntity.ok("Reservation cancelled successfully");

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error cancelling reservation: " + e.getMessage());
        }
    }

    /**
     * Handle reservation fulfillment (when driver starts charging)
     */
    @PostMapping("/reservations/{reservationId}/fulfill")
    public ResponseEntity<?> fulfillReservation(@PathVariable Integer reservationId) {
        try {
            // FIX: Gọi fulfillReservation() từ service
            reservationService.fulfillReservation(reservationId.longValue());

            return ResponseEntity.ok("Reservation fulfilled successfully");

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fulfilling reservation: " + e.getMessage());
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
     */
    private ResponseEntity<?> checkChargingPointAvailability(ChargingPoint chargingPoint) {
        String status = chargingPoint.getStatus().toLowerCase();
        
        if (!STATUS_ACTIVE.equals(status)) {
            if (STATUS_USING.equals(status)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Charging point is currently in use");
            } else if (STATUS_MAINTENANCE.equals(status)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Charging point is under maintenance");
            } else if (STATUS_INACTIVE.equals(status)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Charging point is currently inactive");
            } else if (STATUS_BOOKED.equals(status)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Charging point is already booked");
            }
        }

        // Check if already reserved
        if (hasActiveReservation(chargingPoint.getId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Charging point is currently reserved");
        }

        return null;
    }

    /**
     * Check if charging point has an active reservation
     */
    private boolean hasActiveReservation(Integer chargingPointId) {
        List<Reservation> reservations = reservationService.findByChargingPointId(chargingPointId);
        LocalDateTime now = LocalDateTime.now();

        return reservations.stream()
                .filter(r -> STATUS_ACTIVE.equalsIgnoreCase(r.getStatus()))
                .anyMatch(r -> r.getStartTime().isBefore(now) && r.getEndTime().isAfter(now));
    }

    /**
     * Check for overlapping reservations
     */
    private boolean hasOverlappingReservation(Integer chargingPointId, LocalDateTime startTime, LocalDateTime endTime) {
        List<Reservation> reservations = reservationService.findByChargingPointId(chargingPointId);
        
        return reservations.stream()
                .filter(r -> STATUS_ACTIVE.equalsIgnoreCase(r.getStatus()))
                .anyMatch(r -> {
                    return !(endTime.isBefore(r.getStartTime()) || startTime.isAfter(r.getEndTime()));
                });
    }

    /**
     * Create and save a new reservation
     * KHÔNG ĐỘNG VÀO CHARGING POINT - Service tự xử lý
     */
    private Reservation createAndSaveReservation(Driver driver, ChargingPoint chargingPoint,
                                                 Vehicle vehicle, ReservationRequest request) {

        LocalDateTime startTime = LocalDateTime.now();
        LocalDateTime endTime = startTime.plusMinutes(RESERVATION_DURATION_MINUTES);

        // Build reservation entity
        Reservation reservation = buildReservationEntity(driver, chargingPoint, vehicle, startTime, endTime);
        
        // FIX: Gọi createReservation() - service tự update charging point
        return reservationService.createReservation(reservation);
        
        // REMOVED: Không tự update charging point nữa
        // chargingPoint.setStatus(STATUS_BOOKED);
        // chargingPointService.updateChargingPoint(chargingPoint);
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
        // KHÔNG set status ở đây - service sẽ tự set
        // reservation.setStatus(STATUS_ACTIVE);
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
}