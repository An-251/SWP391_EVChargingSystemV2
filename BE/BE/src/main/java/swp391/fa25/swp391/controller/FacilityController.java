package swp391.fa25.swp391.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.FacilityRequest;
import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.dto.response.FacilityResponse;
import swp391.fa25.swp391.entity.Admin;
import swp391.fa25.swp391.entity.Facility;
import swp391.fa25.swp391.service.IService.IFacilityService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FacilityController {

    private final IFacilityService facilityService;

    /**
     * Create new facility
     * POST /api/facilities/profile
     */
    @PostMapping("/profile")
    public ResponseEntity<?> createFacility(@Valid @RequestBody FacilityRequest request) {
        try {
            Facility newFacility = new Facility();
            newFacility.setName(request.getName());
            newFacility.setCity(request.getCity());
            newFacility.setDistrict(request.getDistrict());
            newFacility.setWard(request.getWard());
            newFacility.setStreetAddress(request.getStreetAddress());

            if (request.getAdminId() != null) {
                Admin admin = new Admin();
                admin.setId(request.getAdminId());
                newFacility.setAdmin(admin);
            }

            Facility savedFacility = facilityService.register(newFacility);

            FacilityResponse facilityResponse = FacilityResponse.builder()
                    .id(savedFacility.getId())
                    .name(savedFacility.getName())
                    .city(savedFacility.getCity())
                    .district(savedFacility.getDistrict())
                    .ward(savedFacility.getWard())
                    .streetAddress(savedFacility.getStreetAddress())
                    .fullAddress(savedFacility.getFullAddress())
                    .adminId(savedFacility.getAdmin() != null ? savedFacility.getAdmin().getId() : null)
                    .stationCount(savedFacility.getChargingStations() != null ? savedFacility.getChargingStations().size() : 0)
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Facility created successfully", facilityResponse));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Error creating facility: " + e.getMessage()));
        }
    }

    /**
     * Update facility by ID
     * PUT /api/facilities/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateFacility(@PathVariable Integer id, @Valid @RequestBody FacilityRequest request) {
        try {
            Facility existingFacility = facilityService.findById(id);

            existingFacility.setName(request.getName());
            existingFacility.setCity(request.getCity());
            existingFacility.setDistrict(request.getDistrict());
            existingFacility.setWard(request.getWard());
            existingFacility.setStreetAddress(request.getStreetAddress());

            if (request.getAdminId() != null) {
                Admin admin = new Admin();
                admin.setId(request.getAdminId());
                existingFacility.setAdmin(admin);
            } else {
                existingFacility.setAdmin(null);
            }

            Facility updatedFacility = facilityService.updateFacility(existingFacility);

            FacilityResponse facilityResponse = FacilityResponse.builder()
                    .id(updatedFacility.getId())
                    .name(updatedFacility.getName())
                    .city(updatedFacility.getCity())
                    .district(updatedFacility.getDistrict())
                    .ward(updatedFacility.getWard())
                    .streetAddress(updatedFacility.getStreetAddress())
                    .fullAddress(updatedFacility.getFullAddress())
                    .adminId(updatedFacility.getAdmin() != null ? updatedFacility.getAdmin().getId() : null)
                    .stationCount(updatedFacility.getChargingStations() != null ? updatedFacility.getChargingStations().size() : 0)
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Facility updated successfully", facilityResponse));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Facility not found with ID: " + id));
        }
    }

    /**
     * Get facility by ID
     * GET /api/facilities/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getFacilityById(@PathVariable Integer id) {
        try {
            Facility facility = facilityService.findById(id);

            FacilityResponse facilityResponse = FacilityResponse.builder()
                    .id(facility.getId())
                    .name(facility.getName())
                    .city(facility.getCity())
                    .district(facility.getDistrict())
                    .ward(facility.getWard())
                    .streetAddress(facility.getStreetAddress())
                    .fullAddress(facility.getFullAddress())
                    .adminId(facility.getAdmin() != null ? facility.getAdmin().getId() : null)
                    .stationCount(facility.getChargingStations() != null ? facility.getChargingStations().size() : 0)
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Facility found", facilityResponse));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Facility not found with ID: " + id));
        }
    }

    /**
     * Get all facilities
     * GET /api/facilities/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getAllFacilities() {
        try {
            List<Facility> facilities = facilityService.findAll();

            List<FacilityResponse> responseList = facilities.stream()
                    .map(facility -> FacilityResponse.builder()
                            .id(facility.getId())
                            .name(facility.getName())
                            .city(facility.getCity())
                            .district(facility.getDistrict())
                            .ward(facility.getWard())
                            .streetAddress(facility.getStreetAddress())
                            .fullAddress(facility.getFullAddress())
                            .adminId(facility.getAdmin() != null ? facility.getAdmin().getId() : null)
                            .stationCount(facility.getChargingStations() != null ? facility.getChargingStations().size() : 0)
                            .build())
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success("Facilities retrieved successfully", responseList));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving facilities: " + e.getMessage()));
        }
    }

    /**
     * Delete facility by ID
     * DELETE /api/facilities/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFacility(@PathVariable Integer id) {
        try {
            facilityService.deleteFacility(id);
            return ResponseEntity.ok(ApiResponse.success("Facility with ID " + id + " deleted successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Facility not found or could not be deleted"));
        }
    }
}