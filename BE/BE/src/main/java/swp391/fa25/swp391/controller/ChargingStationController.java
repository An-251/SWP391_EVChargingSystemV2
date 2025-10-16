package swp391.fa25.swp391.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.entity.ChargingStation;
import swp391.fa25.swp391.service.IService.IChargingStationService;

import java.util.List;


@RestController
@RequestMapping("/api/charging-station")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChargingStationController {

    private final IChargingStationService chargingStationService;

    @PostMapping("/charging-stations")
    public ResponseEntity<?> createChargingStation(@RequestBody ChargingStation chargingStation) {
        try {
            ChargingStation savedStation = chargingStationService.save(chargingStation);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedStation);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error creating charging station: " + e.getMessage());
        }
    }

    @GetMapping("/charging-stations")
    public ResponseEntity<List<ChargingStation>> getAllChargingStation() {
        List<ChargingStation> chargingStation = chargingStationService.findAll();
        return ResponseEntity.ok(chargingStation);
    }

    @GetMapping("/charging-stations/{id}")
    public ResponseEntity<?> getChargingStationById(@PathVariable Integer id) {
        return chargingStationService.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body("Charging station not found with ID: " + id)
                );
    }

    @DeleteMapping("/charging-stations/{id}")
    public ResponseEntity<String> deleteChargingStation(@PathVariable Integer id) {
        try {
            chargingStationService.deleteChargingStation(id);
            return ResponseEntity.ok("Charging station with ID " + id + " deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Charging station not found or could not be deleted.");
        }
    }

    @PutMapping("/charging-stations/{id}")
    public ResponseEntity<?> updateChargingStation(@PathVariable Integer id, @RequestBody ChargingStation updatedStation) {
        return chargingStationService.findById(id)
                .<ResponseEntity<?>>map(existingStation -> {
                    updatedStation.setId(id);
                    ChargingStation savedStation = chargingStationService.updateChargingStation(updatedStation);
                    return ResponseEntity.ok(savedStation);
                })
                .orElseGet(() ->
                        ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body("Charging station not found.")
                );
    }

}
