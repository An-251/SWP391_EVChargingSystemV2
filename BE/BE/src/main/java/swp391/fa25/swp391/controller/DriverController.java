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
import java.util.Optional;
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
     */
    @PostMapping("/{driverId}/reservations")
    public ResponseEntity<?> createReservation(
            @PathVariable Integer driverId,
            @Valid @RequestBody ReservationRequest request) {
        try {
            // 1. Validate driver exists
            Driver driver = driverService.findById(driverId)
                    .orElseThrow(() -> new RuntimeException("Driver not found"));

            // 2. Validate charging point exists
            ChargingPoint chargingPoint = chargingPointService.findById(request.getChargingPointId())
                    .orElseThrow(() -> new RuntimeException("Charging point not found"));

            // 3. Validate charging point status
            if (!"AVAILABLE".equalsIgnoreCase(chargingPoint.getStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Charging point is not available");
            }

            // 4. Check if already reserved
            if (hasActiveReservation(request.getChargingPointId())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Charging point is currently reserved");
            }

            // 5. Set start time to NOW and calculate end time
            LocalDateTime startTime = LocalDateTime.now();
            LocalDateTime endTime = startTime.plusMinutes(request.getDurationMinutes());

            // 6. Create and save reservation
            Reservation reservation = new Reservation();
            reservation.setDriver(driver);
            reservation.setChargingPoint(chargingPoint);
            reservation.setStartTime(startTime);
            reservation.setEndTime(endTime);
            reservation.setStatus("ACTIVE");


            Reservation savedReservation = reservationService.register(reservation);

            // 7. Build simple response
            ReservationResponse response = ReservationResponse.builder()
                    .reservationId(savedReservation.getId())
                    .startTime(savedReservation.getStartTime())
                    .endTime(savedReservation.getEndTime())
                    .chargingPointName(chargingPoint.getPointName())
                    .connectorType(chargingPoint.getConnectorType())
                    .stationName(chargingPoint.getStation() != null ?
                            chargingPoint.getStation().getStationName() : null)
                    .status(savedReservation.getStatus())
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating reservation: " + e.getMessage());
        }
    }

    /**
     * Get all reservations for a driver
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
     */
    @DeleteMapping("/reservations/{reservationId}")
    public ResponseEntity<?> cancelReservation(@PathVariable Integer reservationId) {
        try {
            Reservation reservation = reservationService.findById(reservationId);
            if (reservation == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Reservation not found");
            }

            if (!"ACTIVE".equalsIgnoreCase(reservation.getStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Can only cancel active reservations");
            }

            reservation.setStatus("CANCELLED");
            reservationService.register(reservation);

            return ResponseEntity.ok("Reservation cancelled successfully");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error cancelling reservation: " + e.getMessage());
        }
    }

    // Helper methods

    private boolean hasActiveReservation(Integer chargingPointId) {
        List<Reservation> reservations = reservationService.findByChargingPointId(chargingPointId);
        LocalDateTime now = LocalDateTime.now();

        return reservations.stream()
                .filter(r -> "ACTIVE".equalsIgnoreCase(r.getStatus()))
                .anyMatch(r -> r.getStartTime().isBefore(now) && r.getEndTime().isAfter(now));
    }

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
}