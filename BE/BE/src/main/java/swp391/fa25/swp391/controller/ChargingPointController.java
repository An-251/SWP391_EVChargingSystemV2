package swp391.fa25.swp391.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.ChargingPointRequest;
import swp391.fa25.swp391.dto.request.StatusUpdateRequest;
import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.dto.response.ChargingPointResponse;
import swp391.fa25.swp391.entity.ChargingPoint;
import swp391.fa25.swp391.entity.ChargingStation;
import swp391.fa25.swp391.security.CustomUserDetails;
import swp391.fa25.swp391.service.ChargingPointService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ChargingPointController {

    private final ChargingPointService chargingPointService;

    public ChargingPointController(ChargingPointService chargingPointService) {
        this.chargingPointService = chargingPointService;
    }

    // ==================== HELPER CONVERTER METHODS ====================

    private ChargingPointResponse convertToDto(ChargingPoint point) {
        return ChargingPointResponse.builder()
                .id(point.getId())
                .pointName(point.getPointName())
                .connectorType(point.getConnectorType())
                .maxPower(point.getMaxPower())
                .status(point.getStatus())
                .pricePerKwh(point.getPricePerKwh())
                .stationId(point.getStation() != null ? point.getStation().getId() : null)
                .stationName(point.getStation() != null ? point.getStation().getStationName() : null)
                .build();
    }

    private ChargingPoint convertToEntity(ChargingPointRequest request) {
        ChargingPoint point = new ChargingPoint();
        point.setPointName(request.getPointName());
        point.setConnectorType(request.getConnectorType());
        point.setMaxPower(request.getMaxPower());
        point.setStatus("active"); // Default status
        point.setPricePerKwh(request.getPricePerKwh());

        ChargingStation station = new ChargingStation();
        station.setId(request.getStationId());
        point.setStation(station);

        return point;
    }

    // ==================== CONTROLLER ENDPOINTS ====================

    @PostMapping("/charging-points")
    public ResponseEntity<?> createChargingPoint(@Valid @RequestBody ChargingPointRequest request) {
        try {
            ChargingPoint newPoint = convertToEntity(request);
            ChargingPoint savedPoint = chargingPointService.save(newPoint);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(savedPoint));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error creating charging point: " + e.getMessage());
        }
    }

    @GetMapping("/charging-points")
    public ResponseEntity<List<ChargingPointResponse>> getAllChargingPoints() {
        List<ChargingPoint> chargingPoints = chargingPointService.findAll();
        List<ChargingPointResponse> responseList = chargingPoints.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/charging-points/{id}")
    public ResponseEntity<?> getChargingPointById(@PathVariable Integer id) {
        return chargingPointService.findById(id)
                .<ResponseEntity<?>>map(point -> {
                    ChargingPointResponse response = convertToDto(point);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() ->
                        ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body("Charging point not found with ID: " + id)
                );
    }

    @PutMapping("/charging-points/{id}")
    public ResponseEntity<?> updateChargingPoint(@PathVariable Integer id,
                                                 @Valid @RequestBody ChargingPointRequest request) {
        return chargingPointService.findById(id)
                .<ResponseEntity<?>>map(existingPoint -> {
                    existingPoint.setPointName(request.getPointName());
                    existingPoint.setConnectorType(request.getConnectorType());
                    existingPoint.setMaxPower(request.getMaxPower());
                    // Don't update status here - use separate endpoint
                    existingPoint.setPricePerKwh(request.getPricePerKwh());

                    ChargingStation station = existingPoint.getStation() != null ? existingPoint.getStation() : new ChargingStation();
                    station.setId(request.getStationId());
                    existingPoint.setStation(station);

                    ChargingPoint savedPoint = chargingPointService.updateChargingPoint(existingPoint);
                    return ResponseEntity.ok(convertToDto(savedPoint));
                })
                .orElseGet(() ->
                        ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body("Charging point not found.")
                );
    }

    @DeleteMapping("/charging-points/{id}")
    public ResponseEntity<?> deleteChargingPoint(@PathVariable Integer id) {
        try {
            return chargingPointService.findById(id)
                    .<ResponseEntity<?>>map(point -> {
                        chargingPointService.deleteChargingPoint(id);
                        return ResponseEntity.ok("Charging point with ID " + id + " deleted successfully.");
                    })
                    .orElseGet(() ->
                            ResponseEntity.status(HttpStatus.NOT_FOUND)
                                    .body("Charging point not found with ID: " + id)
                    );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting charging point: " + e.getMessage());
        }
    }

    /**
     * Admin: Update point status (active/inactive)
     * Cannot change to inactive if point is "using"
     * PATCH /api/charging-points/{id}/status
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/charging-points/{id}/status")
    public ResponseEntity<?> updatePointStatus(
            @PathVariable Integer id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            chargingPointService.updatePointStatus(id, request.getStatus());
            return ResponseEntity.ok(
                    ApiResponse.success("Charging point status updated to " + request.getStatus())
            );
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Charging point not found with ID: " + id));
        }
    }

    /**
     * User: Start using a charging point (booking)
     * Automatically sets point to "using" and propagates to station
     * POST /api/charging-points/{id}/start
     */
    @PostMapping("/charging-points/{id}/start")
    public ResponseEntity<?> startUsingPoint(
            @PathVariable Integer id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            chargingPointService.startUsingPoint(id);
            return ResponseEntity.ok(
                    ApiResponse.success("Charging point is now in use")
            );
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Charging point not found with ID: " + id));
        }
    }

    /**
     * User: Stop using a charging point (complete charging)
     * Sets point back to "active" and updates station if no other points are using
     * POST /api/charging-points/{id}/stop
     */
    @PostMapping("/charging-points/{id}/stop")
    public ResponseEntity<?> stopUsingPoint(
            @PathVariable Integer id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            chargingPointService.stopUsingPoint(id);
            return ResponseEntity.ok(
                    ApiResponse.success("Charging session completed")
            );
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Charging point not found with ID: " + id));
        }
    }
}