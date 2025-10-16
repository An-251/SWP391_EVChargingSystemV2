package swp391.fa25.swp391.controller;

import jakarta.validation.Valid; // Import cho @Valid
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.ChargingPointRequest; // Import Request DTO
import swp391.fa25.swp391.dto.response.ChargingPointResponse;
import swp391.fa25.swp391.entity.ChargingPoint;
import swp391.fa25.swp391.entity.ChargingStation; // Cần import ChargingStation Entity
import swp391.fa25.swp391.service.ChargingPointService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ChargingPointController {

    private final ChargingPointService chargingPointService;

    public ChargingPointController(ChargingPointService chargingPointService) {
        this.chargingPointService = chargingPointService;
    }

    // ==================== HELPER CONVERTER METHODS ====================

    private ChargingPointResponse convertToDto(ChargingPoint point) {
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

    private ChargingPoint convertToEntity(ChargingPointRequest request) {
        ChargingPoint point = new ChargingPoint();
        point.setPointName(request.getPointName());
        point.setConnectorType(request.getConnectorType());
        point.setMaxPower(request.getMaxPower());
        point.setStatus(request.getStatus());
        point.setPricePerKwh(request.getPricePerKwh());

        // Xử lý quan hệ: Cần lấy ChargingStation Entity từ ID
        // GIẢ ĐỊNH: ChargingStation đã tồn tại
        ChargingStation station = new ChargingStation(); // Thay bằng stationService.findById(request.getStationId()).orElseThrow(...)
        station.setId(request.getStationId()); // Tạm thời set ID để Service xử lý
        point.setStation(station);

        return point;
    }

    // ==================== CONTROLLER ENDPOINTS ====================

    @PostMapping("/charging-points")
    public ResponseEntity<?> createChargingPoint(@Valid @RequestBody ChargingPointRequest request) {
        try {
            // 1. Convert Request DTO sang Entity
            ChargingPoint newPoint = convertToEntity(request);

            // 2. Save Entity
            ChargingPoint savedPoint = chargingPointService.save(newPoint);

            // 3. Convert Entity sang Response DTO và trả về
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(savedPoint));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error creating charging point: " + e.getMessage());
        }
    }

    // Các phương thức GET, DELETE (không đổi) ...

    @GetMapping("/charging-points")
    public ResponseEntity<List<ChargingPointResponse>> getAllChargingPoints() {
        // ... (logic không đổi) ...
        List<ChargingPoint> chargingPoints = chargingPointService.findAll();
        List<ChargingPointResponse> responseList = chargingPoints.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/charging-points/{id}")
    public ResponseEntity<?> getChargingPointById(@PathVariable Integer id) {
        // ... (logic không đổi) ...
        return chargingPointService.findById(id)
                .<ResponseEntity<?>>map(point -> {
                    ChargingPointResponse response = convertToDto(point);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() ->
                        ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body("Charging point not found with ID: " + id)
                );
    }


    @PutMapping("/charging-points/{id}")
    public ResponseEntity<?> updateChargingPoint(@PathVariable Integer id,
                                                 @Valid @RequestBody ChargingPointRequest request) {
        return chargingPointService.findById(id)
                .<ResponseEntity<?>>map(existingPoint -> {
                    // 1. Cập nhật Entity hiện có bằng dữ liệu từ Request DTO

                    // Cập nhật các trường từ Request
                    existingPoint.setPointName(request.getPointName());
                    existingPoint.setConnectorType(request.getConnectorType());
                    existingPoint.setMaxPower(request.getMaxPower());
                    existingPoint.setStatus(request.getStatus());
                    existingPoint.setPricePerKwh(request.getPricePerKwh());

                    // Cập nhật Station ID
                    ChargingStation station = existingPoint.getStation() != null ? existingPoint.getStation() : new ChargingStation();
                    station.setId(request.getStationId()); // Tạm set ID, service cần tìm lại Entity ChargingStation
                    existingPoint.setStation(station);

                    // 2. Save Entity
                    ChargingPoint savedPoint = chargingPointService.updateChargingPoint(existingPoint);

                    // 3. Convert Entity sang Response DTO và trả về
                    return ResponseEntity.ok(convertToDto(savedPoint));
                })
                .orElseGet(() ->
                        ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body("Charging point not found.")
                );
    }

    // ... (Phương thức DELETE) ...
}