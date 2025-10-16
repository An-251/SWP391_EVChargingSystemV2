package swp391.fa25.swp391.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.entity.Facility;
import swp391.fa25.swp391.service.IService.IFacilityService;

import java.util.List;
@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")

public class FacilityController {

    public final IFacilityService facilityService;

    @GetMapping("/facilities")
    public ResponseEntity<List<Facility>> getAllFacilities() {
        List<Facility> facilities = facilityService.findAll();
        return ResponseEntity.ok(facilities);
    }

    @PostMapping("/facilities")
    public ResponseEntity<?> createFacility(@RequestBody Facility facility) {
        try {
            Facility savedFacility = facilityService.save(facility);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedFacility);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error creating facility: " + e.getMessage());
        }
    }

    @PutMapping("/facilities/{id}")
    public ResponseEntity<?> updateFacility(@PathVariable Integer id, @RequestBody Facility updatedFacility) {
        try {
            Facility existingFacility = facilityService.findById(id);
            updatedFacility.setId(id);
            Facility savedFacility = facilityService.updateFacility(updatedFacility);
            return ResponseEntity.ok(savedFacility);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Facility not found with ID: " + id);
        }
    }

    @DeleteMapping("/facilities/{id}")
    public ResponseEntity<String> deleteFacility(@PathVariable Integer id) {
        try {
            facilityService.deleteFacility(id);
            return ResponseEntity.ok("Facility with ID " + id + " deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Facility not found or could not be deleted.");
        }
    }
}
