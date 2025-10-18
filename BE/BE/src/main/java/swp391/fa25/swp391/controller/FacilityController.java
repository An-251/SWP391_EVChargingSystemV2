package swp391.fa25.swp391.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.FacilityRequest;
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
            // Lấy Account ID từ CustomUserDetails
            Integer accountId = userDetails.getAccount().getId();

            // Tìm Admin theo Account ID
            Admin currentAdmin = adminService.findByAccountId(accountId);

            Facility newFacility = new Facility();
            newFacility.setName(request.getName());
            newFacility.setCity(request.getCity());
            newFacility.setDistrict(request.getDistrict());
            newFacility.setWard(request.getWard());
            newFacility.setStreetAddress(request.getStreetAddress());
            newFacility.setAdmin(currentAdmin); // Gán admin đã đăng nhập

            Facility savedFacility = facilityService.register(newFacility);

            FacilityResponse facilityResponse = FacilityResponse.builder()
                    .id(savedFacility.getId())
                    .name(savedFacility.getName())
                    .city(savedFacility.getCity())
                    .district(savedFacility.getDistrict())
                    .ward(savedFacility.getWard())
                    .streetAddress(savedFacility.getStreetAddress())
                    .fullAddress(savedFacility.getFullAddress())
                    .adminId(savedFacility.getAdmin().getId())
                    .stationCount(0) // Mới tạo nên luôn là 0
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
    public ResponseEntity<?> updateFacility(
            @PathVariable Integer id,
            @Valid @RequestBody FacilityRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            Facility existingFacility = facilityService.findById(id);

            // Lấy Admin của user hiện tại
            Integer accountId = userDetails.getAccount().getId();
            Admin currentAdmin = adminService.findByAccountId(accountId);

            // Kiểm tra quyền sở hữu
            if (!existingFacility.getAdmin().getId().equals(currentAdmin.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("You don't have permission to update this facility"));
            }

            // Update các trường (KHÔNG update admin)
            existingFacility.setName(request.getName());
            existingFacility.setCity(request.getCity());
            existingFacility.setDistrict(request.getDistrict());
            existingFacility.setWard(request.getWard());
            existingFacility.setStreetAddress(request.getStreetAddress());

            Facility updatedFacility = facilityService.updateFacility(existingFacility);

            FacilityResponse facilityResponse = FacilityResponse.builder()
                    .id(updatedFacility.getId())
                    .name(updatedFacility.getName())
                    .city(updatedFacility.getCity())
                    .district(updatedFacility.getDistrict())
                    .ward(updatedFacility.getWard())
                    .streetAddress(updatedFacility.getStreetAddress())
                    .fullAddress(updatedFacility.getFullAddress())
                    .adminId(updatedFacility.getAdmin().getId())
                    .stationCount(updatedFacility.getChargingStations() != null ?
                            updatedFacility.getChargingStations().size() : 0)
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
                    .stationCount(facility.getChargingStations() != null ?
                            facility.getChargingStations().size() : 0)
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
                            .stationCount(facility.getChargingStations() != null ?
                                    facility.getChargingStations().size() : 0)
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
    public ResponseEntity<?> deleteFacility(
            @PathVariable Integer id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            Facility existingFacility = facilityService.findById(id);

            // Lấy Admin của user hiện tại
            Integer accountId = userDetails.getAccount().getId();
            Admin currentAdmin = adminService.findByAccountId(accountId);

            // Kiểm tra quyền sở hữu
            if (!existingFacility.getAdmin().getId().equals(currentAdmin.getId())) {
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
}