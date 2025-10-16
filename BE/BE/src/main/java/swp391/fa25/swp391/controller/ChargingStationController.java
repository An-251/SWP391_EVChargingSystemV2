package swp391.fa25.swp391.controller;

import jakarta.validation.Valid; // Import cho @Valid
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.ChargingStationRequest; // Import Request DTO
import swp391.fa25.swp391.dto.response.ChargingPointResponse;
import swp391.fa25.swp391.dto.response.ChargingStationResponse;
import swp391.fa25.swp391.entity.ChargingPoint;
import swp391.fa25.swp391.entity.ChargingStation;
import swp391.fa25.swp391.entity.Facility; // Cần import Facility Entity
import swp391.fa25.swp391.service.IService.IChargingStationService;

import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChargingStationController {

    private final IChargingStationService chargingStationService;
    // GIẢ ĐỊNH: Bạn có một FacilityService để tìm Facility theo ID
    // private final IFacilityService facilityService;

    // ==================== HELPER CONVERTER METHODS ====================

    private ChargingStationResponse convertToDto(ChargingStation station) {
        // ... (logic không đổi so với lần sửa trước) ...
        List<ChargingPointResponse> pointResponses = station.getChargingPoints().stream()
                .map(this::convertToPointDto)
                .collect(Collectors.toList());

        return ChargingStationResponse.builder()
                .id(station.getId())
                .stationName(station.getStationName())
                .latitude(station.getLatitude())
                .longitude(station.getLongitude())
                .status(station.getStatus())
                // Tránh trả về toàn bộ Facility Entity
                .facilityId(station.getFacility() != null ? station.getFacility().getId() : null)
                .chargingPoints(pointResponses)
                .build();
    }

    private ChargingPointResponse convertToPointDto(ChargingPoint point) {
        // ... (logic không đổi so với lần sửa trước) ...
        return ChargingPointResponse.builder()
                .id(point.getId())
                .pointName(point.getPointName())
                .connectorType(point.getConnectorType())
                .maxPower(point.getMaxPower())
                .status(point.getStatus())
                .pricePerKwh(point.getPricePerKwh())
                .stationId(point.getStation() != null ? point.getStation().getId() : null)
                .stationName(point.getStation() != null ? point.getStation().getStationName() : null)
                .build();
    }

    private ChargingStation convertToEntity(ChargingStationRequest request) {
        ChargingStation station = new ChargingStation();
        station.setStationName(request.getStationName());
        station.setLatitude(request.getLatitude());
        station.setLongitude(request.getLongitude());
        station.setStatus(request.getStatus());

        // Xử lý quan hệ: Cần lấy Facility Entity từ ID
        // GIẢ ĐỊNH: Facility đã tồn tại
        Facility facility = new Facility(); // Thay bằng facilityService.findById(request.getFacilityId()).orElseThrow(...)
        facility.setId(request.getFacilityId()); // Tạm thời set ID để Service xử lý
        station.setFacility(facility);

        return station;
    }


    // ==================== CONTROLLER ENDPOINTS ====================

    @PostMapping("/charging-stations")
    public ResponseEntity<?> createChargingStation(@Valid @RequestBody ChargingStationRequest request) {
        try {
            // 1. Convert Request DTO sang Entity
            ChargingStation newStation = convertToEntity(request);

            // 2. Save Entity
            ChargingStation savedStation = chargingStationService.save(newStation);

            // 3. Convert Entity sang Response DTO và trả về
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(savedStation));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error creating charging station: " + e.getMessage());
        }
    }

    // Các phương thức GET, DELETE (không đổi) ...

    @GetMapping("/charging-stations")
    public ResponseEntity<List<ChargingStationResponse>> getAllChargingStation() {
        // ... (logic không đổi) ...
        List<ChargingStation> chargingStation = chargingStationService.findAll();
        List<ChargingStationResponse> responseList = chargingStation.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/charging-stations/{id}")
    public ResponseEntity<?> getChargingStationById(@PathVariable Integer id) {
        // ... (logic không đổi) ...
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
                    // 1. Cập nhật Entity hiện có bằng dữ liệu từ Request DTO

                    // Cập nhật các trường từ Request
                    existingStation.setStationName(request.getStationName());
                    existingStation.setLatitude(request.getLatitude());
                    existingStation.setLongitude(request.getLongitude());
                    existingStation.setStatus(request.getStatus());

                    // Cập nhật Facility ID
                    Facility facility = existingStation.getFacility() != null ? existingStation.getFacility() : new Facility();
                    facility.setId(request.getFacilityId()); // Tạm set ID, service cần tìm lại Entity Facility
                    existingStation.setFacility(facility);

                    // 2. Save Entity
                    ChargingStation savedStation = chargingStationService.updateChargingStation(existingStation);

                    // 3. Convert Entity sang Response DTO và trả về
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
            // Kiểm tra xem charging station có tồn tại không
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
}