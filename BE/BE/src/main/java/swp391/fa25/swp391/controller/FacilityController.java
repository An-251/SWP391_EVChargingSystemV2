package swp391.fa25.swp391.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.FacilityRequest;
import swp391.fa25.swp391.dto.request.StatusUpdateRequest;
import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.dto.response.FacilityResponse;
import swp391.fa25.swp391.entity.Admin;
import swp391.fa25.swp391.entity.Facility;
import swp391.fa25.swp391.security.CustomUserDetails;
import swp391.fa25.swp391.service.IService.IAdminService;
import swp391.fa25.swp391.service.IService.IFacilityService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FacilityController {

    private final IFacilityService facilityService;
    private final IAdminService adminService;

    /**
     * Create new facility
     * POST /api/facilities/profile
     */
    @PostMapping("/profile")
    public ResponseEntity<?> createFacility(
            @Valid @RequestBody FacilityRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            // Get current admin
            Admin currentAdmin = getCurrentAdmin(userDetails);

            // Create new facility
            Facility newFacility = buildFacilityFromRequest(request, currentAdmin);
            Facility savedFacility = facilityService.register(newFacility);

            // Build response
            FacilityResponse facilityResponse = buildFacilityResponse(savedFacility);

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
    public ResponseEntity<?> updateFacility(
            @PathVariable Integer id,
            @Valid @RequestBody FacilityRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            Facility existingFacility = facilityService.findById(id);
            Admin currentAdmin = getCurrentAdmin(userDetails);

            // Check ownership
            if (!hasPermission(existingFacility, currentAdmin)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("You don't have permission to update this facility"));
            }

            // Update facility fields
            updateFacilityFields(existingFacility, request);
            Facility updatedFacility = facilityService.updateFacility(existingFacility);

            // Build response
            FacilityResponse facilityResponse = buildFacilityResponse(updatedFacility);

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
            FacilityResponse facilityResponse = buildFacilityResponse(facility);

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
                    .map(this::buildFacilityResponse)
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
    public ResponseEntity<?> deleteFacility(
            @PathVariable Integer id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            Facility existingFacility = facilityService.findById(id);
            Admin currentAdmin = getCurrentAdmin(userDetails);

            // Check ownership
            if (!hasPermission(existingFacility, currentAdmin)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("You don't have permission to delete this facility"));
            }

            facilityService.deleteFacility(id);
            return ResponseEntity.ok(ApiResponse.success("Facility with ID " + id + " deleted successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Facility not found or could not be deleted"));
        }
    }

    /**
     * Admin: Update facility status (active/inactive)
     * PATCH /api/facilities/{id}/status
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateFacilityStatus(
            @PathVariable Integer id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            Facility facility = facilityService.findById(id);
            Admin currentAdmin = getCurrentAdmin(userDetails);

            // Check ownership
            if (!hasPermission(facility, currentAdmin)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("You don't have permission to update this facility"));
            }

            // Update status through service
            facilityService.updateFacilityStatus(id, request.getStatus());

            return ResponseEntity.ok(
                    ApiResponse.success("Facility status updated to " + request.getStatus())
            );

        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Facility not found with ID: " + id));
        }
    }

    // ==================== HELPER METHODS ====================

    /**
     * Get current admin from authenticated user details
     */
    private Admin getCurrentAdmin(CustomUserDetails userDetails) {
        Integer accountId = userDetails.getAccount().getId();
        return adminService.findByAccountId(accountId);
    }

    /**
     * Build Facility entity from request and admin
     */
    private Facility buildFacilityFromRequest(FacilityRequest request, Admin admin) {
        Facility facility = new Facility();
        facility.setName(request.getName());
        facility.setCity(request.getCity());
        facility.setDistrict(request.getDistrict());
        facility.setWard(request.getWard());
        facility.setStreetAddress(request.getStreetAddress());
        facility.setAdmin(admin);
        facility.setStatus("active"); // Default status
        return facility;
    }

    /**
     * Update facility fields from request
     */
    private void updateFacilityFields(Facility facility, FacilityRequest request) {
        facility.setName(request.getName());
        facility.setCity(request.getCity());
        facility.setDistrict(request.getDistrict());
        facility.setWard(request.getWard());
        facility.setStreetAddress(request.getStreetAddress());
    }

    /**
     * Build FacilityResponse from Facility entity
     */
    private FacilityResponse buildFacilityResponse(Facility facility) {
        return FacilityResponse.builder()
                .id(facility.getId())
                .name(facility.getName())
                .city(facility.getCity())
                .district(facility.getDistrict())
                .ward(facility.getWard())
                .streetAddress(facility.getStreetAddress())
                .fullAddress(facility.getFullAddress())
                .status(facility.getStatus()) // Add status to response
                .adminId(facility.getAdmin() != null ? facility.getAdmin().getId() : null)
                .stationCount(facility.getChargingStations() != null ?
                        facility.getChargingStations().size() : 0)
                .build();
    }

    /**
     * Check if admin has permission to modify facility
     */
    private boolean hasPermission(Facility facility, Admin admin) {
        return facility.getAdmin() != null &&
                facility.getAdmin().getId().equals(admin.getId());
    }
}