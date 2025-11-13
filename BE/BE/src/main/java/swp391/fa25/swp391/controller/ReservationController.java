package swp391.fa25.swp391.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.dto.response.ReservationResponse;
import swp391.fa25.swp391.entity.Reservation;
import swp391.fa25.swp391.repository.ReservationRepository;
import swp391.fa25.swp391.service.ReservationService;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST Controller for Reservation Management
 * Provides APIs for viewing reservations (mainly for Employee monitoring)
 */
@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReservationController {

    private final ReservationService reservationService;
    private final ReservationRepository reservationRepository;

    /**
     * Get all reservations by facility (for Employee monitoring)
     * GET /api/reservations/facility/{facilityId}
     */
    @GetMapping("/facility/{facilityId}")
    public ResponseEntity<ApiResponse> getReservationsByFacility(
            @PathVariable Integer facilityId,
            @RequestParam(required = false) String status) {
        try {
            System.out.println("🔍 Fetching reservations for facility ID: " + facilityId);
            
            List<Reservation> allReservations = reservationRepository.findAll();
            
            // Filter by facility through ChargingPoint -> Station -> Facility
            List<Reservation> facilityReservations = allReservations.stream()
                    .filter(res -> {
                        if (res.getChargingPoint() == null) return false;
                        if (res.getChargingPoint().getStation() == null) return false;
                        if (res.getChargingPoint().getStation().getFacility() == null) return false;
                        return res.getChargingPoint().getStation().getFacility().getId().equals(facilityId);
                    })
                    .collect(Collectors.toList());
            
            // Filter by status if provided
            if (status != null && !status.isEmpty()) {
                facilityReservations = facilityReservations.stream()
                        .filter(r -> status.equalsIgnoreCase(r.getStatus()))
                        .collect(Collectors.toList());
            }
            
            // Sort by start time descending
            facilityReservations.sort((r1, r2) -> r2.getStartTime().compareTo(r1.getStartTime()));
            
            List<ReservationResponse> responses = facilityReservations.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
            
            System.out.println("✅ Found " + responses.size() + " reservations for facility " + facilityId);
            return ResponseEntity.ok(ApiResponse.success(
                    "Retrieved " + responses.size() + " reservations", 
                    responses
            ));
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching reservations by facility: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving reservations: " + e.getMessage()));
        }
    }

    /**
     * Get all reservations (for Admin/monitoring)
     * GET /api/reservations
     */
    @GetMapping
    public ResponseEntity<ApiResponse> getAllReservations(
            @RequestParam(required = false) String status) {
        try {
            List<Reservation> reservations = reservationRepository.findAll();
            
            // Filter by status if provided
            if (status != null && !status.isEmpty()) {
                reservations = reservations.stream()
                        .filter(r -> status.equalsIgnoreCase(r.getStatus()))
                        .collect(Collectors.toList());
            }
            
            // Sort by start time descending
            reservations.sort((r1, r2) -> r2.getStartTime().compareTo(r1.getStartTime()));
            
            List<ReservationResponse> responses = reservations.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(
                    "Retrieved " + responses.size() + " reservations", 
                    responses
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving reservations: " + e.getMessage()));
        }
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    private ReservationResponse mapToResponse(Reservation reservation) {
        return ReservationResponse.builder()
                .reservationId(reservation.getId())
                .driverId(reservation.getDriver() != null ? reservation.getDriver().getId() : null)
                .driverName(reservation.getDriver() != null && reservation.getDriver().getAccount() != null ? 
                        reservation.getDriver().getAccount().getFullName() : null)
                .vehicleId(reservation.getVehicle() != null ? reservation.getVehicle().getId().longValue() : null)
                .vehicleLicensePlate(reservation.getVehicle() != null ? 
                        reservation.getVehicle().getLicensePlate() : null)
                .chargingPointId(reservation.getChargingPoint() != null ? 
                        reservation.getChargingPoint().getId() : null)
                .chargingPointName(reservation.getChargingPoint() != null ? 
                        reservation.getChargingPoint().getPointName() : null)
                .stationId(reservation.getChargingPoint() != null && 
                        reservation.getChargingPoint().getStation() != null ? 
                        reservation.getChargingPoint().getStation().getId() : null)
                .stationName(reservation.getChargingPoint() != null && 
                        reservation.getChargingPoint().getStation() != null ? 
                        reservation.getChargingPoint().getStation().getStationName() : null)
                .facilityId(reservation.getChargingPoint() != null && 
                        reservation.getChargingPoint().getStation() != null &&
                        reservation.getChargingPoint().getStation().getFacility() != null ? 
                        reservation.getChargingPoint().getStation().getFacility().getId() : null)
                .facilityName(reservation.getChargingPoint() != null && 
                        reservation.getChargingPoint().getStation() != null &&
                        reservation.getChargingPoint().getStation().getFacility() != null ? 
                        reservation.getChargingPoint().getStation().getFacility().getName() : null)
                .startTime(reservation.getStartTime())
                .endTime(reservation.getEndTime())
                .status(reservation.getStatus())
                .build();
    }
}
