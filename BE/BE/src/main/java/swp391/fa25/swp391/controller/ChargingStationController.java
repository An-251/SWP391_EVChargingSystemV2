package swp391.fa25.swp391.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.ChargingStationRequest;
import swp391.fa25.swp391.dto.request.StatusUpdateRequest;
import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.dto.response.ChargerResponse;
import swp391.fa25.swp391.dto.response.ChargingPointResponse;
import swp391.fa25.swp391.dto.response.ChargingStationResponse;
import swp391.fa25.swp391.entity.ChargingPoint;
import swp391.fa25.swp391.entity.ChargingStation;
import swp391.fa25.swp391.entity.Facility;
import swp391.fa25.swp391.security.CustomUserDetails;
import swp391.fa25.swp391.service.IService.IChargingStationService;

import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChargingStationController {

    private final IChargingStationService chargingStationService;

    // ==================== HELPER CONVERTER METHODS ====================

    private String buildAddress(String street, String ward, String district, String city) {
        StringBuilder address = new StringBuilder();
        if (street != null && !street.isEmpty()) address.append(street);
        if (ward != null && !ward.isEmpty()) {
            if (address.length() > 0) address.append(", ");
            address.append(ward);
        }
        if (district != null && !district.isEmpty()) {
            if (address.length() > 0) address.append(", ");
            address.append(district);
        }
        if (city != null && !city.isEmpty()) {
            if (address.length() > 0) address.append(", ");
            address.append(city);
        }
        return address.toString();
    }

    private ChargingStationResponse convertToDto(ChargingStation station) {

        List<ChargingPointResponse> pointResponses = station.getChargingPoints() != null ?
                station.getChargingPoints().stream()
                        .map(this::convertToPointDto)
                        .collect(Collectors.toList()) : List.of();

        // Build facility info to avoid circular reference
        ChargingStationResponse.FacilityInfo facilityInfo = null;
        if (station.getFacility() != null) {
            Facility facility = station.getFacility();

            // Build full address from components
            String fullAddress = buildAddress(
                    facility.getStreetAddress(),
                    facility.getWard(),
                    facility.getDistrict(),
                    facility.getCity()
            );

            facilityInfo = ChargingStationResponse.FacilityInfo.builder()
                    .id(facility.getId())
                    .name(facility.getName())
                    .streetAddress(facility.getStreetAddress())
                    .ward(facility.getWard())
                    .district(facility.getDistrict())
                    .city(facility.getCity())
                    .address(fullAddress)
                    .build();
        }

        return ChargingStationResponse.builder()
                .id(station.getId())
                .stationName(station.getStationName())
                .latitude(station.getLatitude())
                .longitude(station.getLongitude())
                .status(station.getStatus())
                .facilityId(station.getFacility() != null ? station.getFacility().getId() : null)
                .facility(facilityInfo)
                .chargingPoints(pointResponses)
                .pointCount(station.getChargingPoints() != null ? station.getChargingPoints().size() : 0)
                .build();
    }

    private ChargingPointResponse convertToPointDto(ChargingPoint point) {
        // Map chargers to ChargerResponse
        List<ChargerResponse> chargerResponses = null;
        if (point.getChargers() != null) {
            chargerResponses = point.getChargers().stream()
                    .map(charger -> ChargerResponse.builder()
                            .id(charger.getId())
                            .chargerCode(charger.getChargerCode())
                            .connectorType(charger.getConnectorType())
                            .maxPower(charger.getMaxPower())
                            .status(charger.getStatus())
                            .chargingPointId(point.getId())
                            .chargingPointName(point.getPointName())
                            .build())
                    .collect(Collectors.toList());
        }
        
        return ChargingPointResponse.builder()
                .id(point.getId())
                .pointName(point.getPointName())
                .status(point.getStatus())
                .pricePerKwh(point.getPricePerKwh())
                .stationId(point.getStation() != null ? point.getStation().getId() : null)
                .stationName(point.getStation() != null ? point.getStation().getStationName() : null)
                .chargers(chargerResponses)
                .build();
    }

    private ChargingStation convertToEntity(ChargingStationRequest request) {
        ChargingStation station = new ChargingStation();
        station.setStationName(request.getStationName());
        station.setLatitude(request.getLatitude());
        station.setLongitude(request.getLongitude());
        station.setStatus("active"); // Default status

        Facility facility = new Facility();
        facility.setId(request.getFacilityId());
        station.setFacility(facility);

        return station;
    }


    // ==================== CONTROLLER ENDPOINTS ====================

    @PostMapping("/charging-stations")
    public ResponseEntity<?> createChargingStation(@Valid @RequestBody ChargingStationRequest request) {
        try {
            ChargingStation newStation = convertToEntity(request);
            ChargingStation savedStation = chargingStationService.save(newStation);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(savedStation));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error creating charging station: " + e.getMessage());
        }
    }

    @GetMapping("/charging-stations")
    public ResponseEntity<List<ChargingStationResponse>> getAllChargingStation() {
        List<ChargingStation> chargingStation = chargingStationService.findAll();
        List<ChargingStationResponse> responseList = chargingStation.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/charging-stations/{id}")
    public ResponseEntity<?> getChargingStationById(@PathVariable Integer id) {
        return chargingStationService.findById(id)
                .<ResponseEntity<?>>map(station -> {
                    ChargingStationResponse response = convertToDto(station);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() ->
                        ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body("Charging station not found with ID: " + id)
                );
    }

    @PutMapping("/charging-stations/{id}")
    public ResponseEntity<?> updateChargingStation(@PathVariable Integer id, @Valid @RequestBody ChargingStationRequest request) {
        return chargingStationService.findById(id)
                .<ResponseEntity<?>>map(existingStation -> {
                    existingStation.setStationName(request.getStationName());
                    existingStation.setLatitude(request.getLatitude());
                    existingStation.setLongitude(request.getLongitude());
                    // Don't update status here - use separate endpoint

                    Facility facility = existingStation.getFacility() != null ? existingStation.getFacility() : new Facility();
                    facility.setId(request.getFacilityId());
                    existingStation.setFacility(facility);

                    ChargingStation savedStation = chargingStationService.updateChargingStation(existingStation);
                    return ResponseEntity.ok(convertToDto(savedStation));
                })
                .orElseGet(() ->
                        ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body("Charging station not found.")
                );
    }

    @DeleteMapping("/charging-stations/{id}")
    public ResponseEntity<?> deleteChargingStation(@PathVariable Integer id) {
        try {
            return chargingStationService.findById(id)
                    .<ResponseEntity<?>>map(station -> {
                        chargingStationService.deleteChargingStation(id);
                        return ResponseEntity.ok("Charging station with ID " + id + " deleted successfully.");
                    })
                    .orElseGet(() ->
                            ResponseEntity.status(HttpStatus.NOT_FOUND)
                                    .body("Charging station not found with ID: " + id)
                    );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting charging station: " + e.getMessage());
        }
    }

    /**
     * Admin: Update station status (active/inactive)
     * Cannot change to inactive if station or any point is "using"
     * PATCH /api/charging-stations/{id}/status
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/charging-stations/{id}/status")
    public ResponseEntity<?> updateStationStatus(
            @PathVariable Integer id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            chargingStationService.updateStationStatus(id, request.getStatus());
            return ResponseEntity.ok(
                    ApiResponse.success("Station status updated to " + request.getStatus())
            );
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Station not found with ID: " + id));
        }
    }
}