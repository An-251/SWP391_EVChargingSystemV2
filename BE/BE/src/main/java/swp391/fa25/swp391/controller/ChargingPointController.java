package swp391.fa25.swp391.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.entity.ChargingPoint;
import swp391.fa25.swp391.service.ChargingPointService;

import java.util.List;

@RestController
@RequestMapping("/api/charging-points")
public class ChargingPointController {

    private final ChargingPointService chargingPointService;

    public ChargingPointController(ChargingPointService chargingPointService) {
        this.chargingPointService = chargingPointService;
    }

    @PostMapping("/charging-points")
    public ResponseEntity<?> createChargingPoint(@RequestBody ChargingPoint chargingPoint) {
        try {
            ChargingPoint savedPoint = chargingPointService.save(chargingPoint);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedPoint);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error creating charging point: " + e.getMessage());
        }
    }

    @GetMapping("/charging-points")
    public ResponseEntity<List<ChargingPoint>> getAllChargingPoints() {
        List<ChargingPoint> chargingPoints = chargingPointService.findAll();
        return ResponseEntity.ok(chargingPoints);
    }

    @GetMapping("/charging-points/{id}")
    public ResponseEntity<?> getChargingPointById(@PathVariable Integer id) {
        return chargingPointService.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body("Charging point not found with ID: " + id)
                );
    }

    @DeleteMapping("/charging-points/{id}")
    public ResponseEntity<String> deleteChargingPoint(@PathVariable Integer id) {
        try {
            chargingPointService.deleteChargingPoint(id);
            return ResponseEntity.ok("Charging point with ID " + id + " deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Charging point not found or could not be deleted.");
        }
    }

    @PutMapping("/charging-points/{id}")
    public ResponseEntity<?> updateChargingPoint(@PathVariable Integer id,
                                                 @RequestBody ChargingPoint updatedPoint) {
        return chargingPointService.findById(id)
                .<ResponseEntity<?>>map(existingPoint -> {
                    updatedPoint.setId(id);
                    ChargingPoint savedPoint = chargingPointService.updateChargingPoint(updatedPoint);
                    return ResponseEntity.ok(savedPoint);
                })
                .orElseGet(() ->
                        ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body("Charging point not found.")
                );
    }
}