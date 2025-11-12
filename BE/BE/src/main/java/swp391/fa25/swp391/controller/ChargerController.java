package swp391.fa25.swp391.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.ChargerRequest;
import swp391.fa25.swp391.dto.request.StatusUpdateRequest;
import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.dto.response.ChargerResponse;
import swp391.fa25.swp391.entity.Charger;
import swp391.fa25.swp391.entity.ChargingPoint;
import swp391.fa25.swp391.security.CustomUserDetails;
import swp391.fa25.swp391.service.ChargerService;
import swp391.fa25.swp391.service.IService.IChargingPointService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ChargerController {

    private final ChargerService chargerService;
    private final IChargingPointService chargingPointService;

    public ChargerController(ChargerService chargerService, IChargingPointService chargingPointService) {
        this.chargerService = chargerService;
        this.chargingPointService = chargingPointService;
    }

    // ==================== HELPER CONVERTER METHODS ====================

    private ChargerResponse convertToDto(Charger charger) {
        return ChargerResponse.builder()
                .id(charger.getId())
                .chargerCode(charger.getChargerCode())
                .connectorType(charger.getConnectorType())
                .maxPower(charger.getMaxPower())
                .status(charger.getStatus())
                .chargingPointId(charger.getChargingPoint() != null ? charger.getChargingPoint().getId() : null)
                .chargingPointName(charger.getChargingPoint() != null ? charger.getChargingPoint().getPointName() : null)
                .build();
    }

    private Charger convertToEntity(ChargerRequest request) {
        Charger charger = new Charger();
        charger.setChargerCode(request.getChargerCode());
        charger.setConnectorType(request.getConnectorType());
        charger.setMaxPower(request.getMaxPower());
        charger.setStatus(request.getStatus());

        ChargingPoint chargingPoint = new ChargingPoint();
        chargingPoint.setId(request.getChargingPointId());
        charger.setChargingPoint(chargingPoint);

        return charger;
    }

    // ==================== CONTROLLER ENDPOINTS ====================

    @PostMapping("/chargers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCharger(@Valid @RequestBody ChargerRequest request) {
        try {
            // Validate charging point exists
            ChargingPoint point = chargingPointService.findById(request.getChargingPointId())
                    .orElseThrow(() -> new IllegalArgumentException("Charging point not found"));

            Charger newCharger = convertToEntity(request);
            newCharger.setChargingPoint(point);
            Charger savedCharger = chargerService.save(newCharger);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(savedCharger));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Error creating charger: " + e.getMessage()));
        }
    }

    @GetMapping("/chargers")
    public ResponseEntity<List<ChargerResponse>> getAllChargers() {
        List<Charger> chargers = chargerService.findAll();
        List<ChargerResponse> responseList = chargers.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/chargers/{id}")
    public ResponseEntity<?> getChargerById(@PathVariable Integer id) {
        return chargerService.findById(id)
                .<ResponseEntity<?>>map(charger -> {
                    ChargerResponse response = convertToDto(charger);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() ->
                        ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(ApiResponse.error("Charger not found with ID: " + id))
                );
    }

    @GetMapping("/charging-points/{pointId}/chargers")
    public ResponseEntity<List<ChargerResponse>> getChargersByChargingPoint(@PathVariable Integer pointId) {
        List<Charger> chargers = chargerService.findByChargingPointId(pointId);
        List<ChargerResponse> responseList = chargers.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseList);
    }

    @PutMapping("/chargers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCharger(@PathVariable Integer id,
                                          @Valid @RequestBody ChargerRequest request) {
        return chargerService.findById(id)
                .<ResponseEntity<?>>map(existingCharger -> {
                    try {
                        existingCharger.setChargerCode(request.getChargerCode());
                        existingCharger.setConnectorType(request.getConnectorType());
                        existingCharger.setMaxPower(request.getMaxPower());
                        // Don't update status here - use separate endpoint

                        ChargingPoint point = chargingPointService.findById(request.getChargingPointId())
                                .orElseThrow(() -> new IllegalArgumentException("Charging point not found"));
                        existingCharger.setChargingPoint(point);

                        Charger savedCharger = chargerService.updateCharger(existingCharger);
                        return ResponseEntity.ok(convertToDto(savedCharger));
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.error(e.getMessage()));
                    }
                })
                .orElseGet(() ->
                        ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(ApiResponse.error("Charger not found"))
                );
    }

    @DeleteMapping("/chargers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCharger(@PathVariable Integer id) {
        try {
            return chargerService.findById(id)
                    .<ResponseEntity<?>>map(charger -> {
                        chargerService.deleteCharger(id);
                        return ResponseEntity.ok(ApiResponse.success("Charger with ID " + id + " deleted successfully."));
                    })
                    .orElseGet(() ->
                            ResponseEntity.status(HttpStatus.NOT_FOUND)
                                    .body(ApiResponse.error("Charger not found with ID: " + id))
                    );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error deleting charger: " + e.getMessage()));
        }
    }

    /**
     * Admin: Update charger status (active/inactive/maintenance)
     * Cannot change to inactive if charger is "using"
     * PATCH /api/chargers/{id}/status
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/chargers/{id}/status")
    public ResponseEntity<?> updateChargerStatus(
            @PathVariable Integer id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            chargerService.updateStatus(id, request.getStatus());
            return ResponseEntity.ok(
                    ApiResponse.success("Charger status updated to " + request.getStatus())
            );
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Charger not found with ID: " + id));
        }
    }

    /**
     * User: Start using a charger (charging session)
     * Automatically sets charger to "using"
     * POST /api/chargers/{id}/start
     */
    @PostMapping("/chargers/{id}/start")
    public ResponseEntity<?> startUsingCharger(
            @PathVariable Integer id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            chargerService.startUsingCharger(id);
            return ResponseEntity.ok(
                    ApiResponse.success("Charger is now in use")
            );
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Charger not found with ID: " + id));
        }
    }

    /**
     * User: Stop using a charger (complete charging)
     * Sets charger back to "active"
     * POST /api/chargers/{id}/stop
     */
    @PostMapping("/chargers/{id}/stop")
    public ResponseEntity<?> stopUsingCharger(
            @PathVariable Integer id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            chargerService.stopUsingCharger(id);
            return ResponseEntity.ok(
                    ApiResponse.success("Charging session completed")
            );
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Charger not found with ID: " + id));
        }
    }
}
