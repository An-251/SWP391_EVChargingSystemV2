package swp391.fa25.swp391.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.FacilityRequest;
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

    // ==================== HELPER CONVERTER METHODS ====================

    /**
     * Chuyển đổi từ Facility Entity sang FacilityResponse DTO.
     */
    private FacilityResponse convertToDto(Facility facility) {
        return FacilityResponse.builder()
                .id(facility.getId())
                .name(facility.getName())
                .city(facility.getCity())
                .district(facility.getDistrict())
                .ward(facility.getWard())
                .streetAddress(facility.getStreetAddress())
                .fullAddress(facility.getFullAddress()) // Sử dụng phương thức transient
                .adminId(facility.getAdmin() != null ? facility.getAdmin().getId() : null)
                .stationCount(facility.getChargingStations() != null ? facility.getChargingStations().size() : 0)
                .build();
    }

    /**
     * Chuyển đổi từ FacilityRequest DTO sang Facility Entity (khi tạo mới).
     */
    private Facility convertToEntity(FacilityRequest request) {
        Facility facility = new Facility();
        facility.setName(request.getName());
        facility.setCity(request.getCity());
        facility.setDistrict(request.getDistrict());
        facility.setWard(request.getWard());
        facility.setStreetAddress(request.getStreetAddress());

        // Thiết lập quan hệ với Admin
        // Service sẽ chịu trách nhiệm kiểm tra adminId có tồn tại không
        if (request.getAdminId() != null) {
            Admin admin = new Admin();
            admin.setId(request.getAdminId());
            facility.setAdmin(admin);
        }
        return facility;
    }

    /**
     * Cập nhật một Facility Entity đã tồn tại từ FacilityRequest DTO.
     */
    private void updateEntityFromRequest(Facility facility, FacilityRequest request) {
        facility.setName(request.getName());
        facility.setCity(request.getCity());
        facility.setDistrict(request.getDistrict());
        facility.setWard(request.getWard());
        facility.setStreetAddress(request.getStreetAddress());

        // Cập nhật quan hệ với Admin
        if (request.getAdminId() != null) {
            Admin admin = new Admin();
            admin.setId(request.getAdminId());
            facility.setAdmin(admin);
        } else {
            facility.setAdmin(null);
        }
    }


    // ==================== CONTROLLER ENDPOINTS ====================

    @PostMapping("/profile")
    public ResponseEntity<?> createFacility(@Valid @RequestBody FacilityRequest request) {
        try {
            Facility newFacility = convertToEntity(request);
            Facility savedFacility = facilityService.register(newFacility);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(savedFacility));
        } catch (Exception e) {
            // Cân nhắc log lỗi ra để debug
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error creating facility: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateFacility(@PathVariable Integer id, @Valid @RequestBody FacilityRequest request) {
        try {
            Facility existingFacility = facilityService.findById(id);
            updateEntityFromRequest(existingFacility, request);
            Facility updatedFacility = facilityService.updateFacility(existingFacility);
            return ResponseEntity.ok(convertToDto(updatedFacility));
        } catch (Exception e) { // Bắt lỗi nếu service ném ra (vd: không tìm thấy)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Facility not found with ID: " + id);
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<List<FacilityResponse>> getAllFacilities() {
        List<Facility> facilities = facilityService.findAll();
        List<FacilityResponse> responseList = facilities.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseList);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFacility(@PathVariable Integer id) {
        try {
            facilityService.deleteFacility(id);
            return ResponseEntity.ok("Facility with ID " + id + " deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Facility not found or could not be deleted.");
        }
    }
}