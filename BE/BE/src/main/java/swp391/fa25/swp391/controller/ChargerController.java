package swp391.fa25.swp391.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.ChargerRequest;
import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.dto.response.ChargerResponse;
import swp391.fa25.swp391.entity.Charger;
import swp391.fa25.swp391.entity.ChargingPoint;
import swp391.fa25.swp391.service.IService.IChargerService;
import swp391.fa25.swp391.service.IService.IChargingPointService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Charger Controller - Admin management of chargers
 */
@RestController
@RequestMapping("/api/chargers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChargerController {

    private final IChargerService chargerService;
    private final IChargingPointService chargingPointService;

    /**
     * Get all chargers with pagination
     * GET /api/chargers?page=0&size=10
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllChargers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        List<Charger> chargers = chargerService.findAll();
        
        // Manual pagination
        int start = page * size;
        int end = Math.min((page + 1) * size, chargers.size());
        List<Charger> pagedChargers = chargers.subList(Math.min(start, chargers.size()), end);
        
        List<ChargerResponse> responses = pagedChargers.stream()
                .map(this::buildChargerResponse)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("content", responses);
        response.put("currentPage", page);
        response.put("totalItems", chargers.size());
        response.put("totalPages", (int) Math.ceil((double) chargers.size() / size));

        return ResponseEntity.ok(response);
    }

    /**
     * Get charger by ID
     * GET /api/chargers/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getChargerById(@PathVariable Integer id) {
        return chargerService.findById(id)
                .map(charger -> ResponseEntity.ok(
                        ApiResponse.success("Charger found", buildChargerResponse(charger))))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Charger not found")));
    }

    /**
     * Get chargers by charging point ID
     * GET /api/chargers/charging-point/{pointId}
     */
    @GetMapping("/charging-point/{pointId}")
    public ResponseEntity<ApiResponse> getChargersByChargingPoint(@PathVariable Integer pointId) {
        List<Charger> chargers = chargerService.findByChargingPointId(pointId);
        List<ChargerResponse> responses = chargers.stream()
                .map(this::buildChargerResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Chargers retrieved", responses));
    }

    /**
     * Create new charger
     * POST /api/chargers
     */
    @PostMapping
    public ResponseEntity<ApiResponse> createCharger(@RequestBody ChargerRequest request) {
        try {
            // Validate charging point exists
            ChargingPoint chargingPoint = chargingPointService.findById(request.getChargingPointId())
                    .orElseThrow(() -> new RuntimeException("Charging point not found"));

            // Create charger entity
            Charger charger = new Charger();
            charger.setChargerCode(request.getChargerCode());
            charger.setMaxPower(request.getMaxPower());
            charger.setConnectorType(request.getConnectorType());
            charger.setStatus(request.getStatus() != null ? request.getStatus() : "active");
            charger.setChargingPoint(chargingPoint);

            Charger savedCharger = chargerService.save(charger);
            ChargerResponse response = buildChargerResponse(savedCharger);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Charger created successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Error creating charger: " + e.getMessage()));
        }
    }

    /**
     * Update existing charger
     * PUT /api/chargers/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateCharger(
            @PathVariable Integer id, 
            @RequestBody ChargerRequest request) {
        try {
            Charger existingCharger = chargerService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Charger not found"));

            // Update fields
            if (request.getChargerCode() != null) {
                existingCharger.setChargerCode(request.getChargerCode());
            }
            if (request.getMaxPower() != null) {
                existingCharger.setMaxPower(request.getMaxPower());
            }
            if (request.getConnectorType() != null) {
                existingCharger.setConnectorType(request.getConnectorType());
            }
            if (request.getStatus() != null) {
                existingCharger.setStatus(request.getStatus());
            }
            if (request.getChargingPointId() != null) {
                ChargingPoint chargingPoint = chargingPointService.findById(request.getChargingPointId())
                        .orElseThrow(() -> new RuntimeException("Charging point not found"));
                existingCharger.setChargingPoint(chargingPoint);
            }

            Charger updatedCharger = chargerService.updateCharger(existingCharger);
            ChargerResponse response = buildChargerResponse(updatedCharger);

            return ResponseEntity.ok(ApiResponse.success("Charger updated successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Error updating charger: " + e.getMessage()));
        }
    }

    /**
     * Delete charger
     * DELETE /api/chargers/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteCharger(@PathVariable Integer id) {
        try {
            if (!chargerService.findById(id).isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Charger not found"));
            }

            chargerService.deleteCharger(id);
            return ResponseEntity.ok(ApiResponse.success("Charger deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error deleting charger: " + e.getMessage()));
        }
    }

    /**
     * Update charger status
     * PUT /api/chargers/{id}/status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse> updateChargerStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {
        try {
            String newStatus = request.get("status");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Status is required"));
            }

            chargerService.updateStatus(id, newStatus);
            return ResponseEntity.ok(ApiResponse.success("Charger status updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Error updating status: " + e.getMessage()));
        }
    }

    // ==================== HELPER METHODS ====================

    private ChargerResponse buildChargerResponse(Charger charger) {
        ChargerResponse response = new ChargerResponse();
        response.setId(charger.getId());
        response.setChargerCode(charger.getChargerCode());
        response.setMaxPower(charger.getMaxPower());
        response.setConnectorType(charger.getConnectorType());
        response.setStatus(charger.getStatus());
        
        if (charger.getChargingPoint() != null) {
            response.setChargingPointId(charger.getChargingPoint().getId());
            response.setChargingPointName(charger.getChargingPoint().getPointName());
        }
        
        return response;
    }
}
