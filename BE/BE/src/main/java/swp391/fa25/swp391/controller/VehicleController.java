package swp391.fa25.swp391.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.VehicleRequest;
import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.dto.response.VehicleResponse;
import swp391.fa25.swp391.entity.Driver;
import swp391.fa25.swp391.entity.Vehicle;
import swp391.fa25.swp391.service.IService.IDriverService;
import swp391.fa25.swp391.service.IService.IVehicleService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174"})
public class VehicleController {

    private final IVehicleService vehicleService;
    private final IDriverService driverService;

    private static final int MAX_VEHICLES_PER_DRIVER = 3;

    /**
     * Đăng ký xe mới cho driver
     * POST /api/vehicles/register
     * Giới hạn: Mỗi driver tối đa 3 xe
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerVehicle(
            @Valid @RequestBody VehicleRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Authentication required"));
            }

            String username = userDetails.getUsername();

            // Tìm driver theo username
            Optional<Driver> driverOpt = driverService.findByUsername(username);
            if (driverOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Driver not found"));
            }

            Driver driver = driverOpt.get();

            // Kiểm tra số lượng xe hiện tại của driver
            int currentVehicleCount = vehicleService.countByDriverId(driver.getId());
            if (currentVehicleCount >= MAX_VEHICLES_PER_DRIVER) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Maximum vehicle limit reached. You can only register up to " + MAX_VEHICLES_PER_DRIVER + " vehicles."));
            }

            // Kiểm tra biển số xe đã tồn tại chưa
            if (vehicleService.existsByLicensePlate(request.getLicensePlate())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(ApiResponse.error("License plate already exists"));
            }

            // Tạo vehicle mới
            Vehicle vehicle = new Vehicle();
            vehicle.setLicensePlate(request.getLicensePlate());
            vehicle.setBrand(request.getBrand());
            vehicle.setModel(request.getModel());
            vehicle.setChargingPort(request.getChargingPort());
            vehicle.setBatteryCapacity(request.getBatteryCapacity());
            vehicle.setDriver(driver);

            // Lưu vehicle
            Vehicle savedVehicle = vehicleService.save(vehicle);

            // Tạo response với thông tin remainingSlots
            VehicleResponse vehicleResponse = VehicleResponse.builder()
                    .id(savedVehicle.getId())
                    .licensePlate(savedVehicle.getLicensePlate())
                    .brand(savedVehicle.getBrand())
                    .model(savedVehicle.getModel())
                    .chargingPort(savedVehicle.getChargingPort())
                    .batteryCapacity(savedVehicle.getBatteryCapacity())
                    .driverId(driver.getId())
                    .driverName(driver.getAccount().getUsername())
                    .build();

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("vehicle", vehicleResponse);
            responseData.put("remainingSlots", MAX_VEHICLES_PER_DRIVER - currentVehicleCount - 1);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Vehicle registered successfully", responseData));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error registering vehicle: " + e.getMessage()));
        }
    }

    /**
     * Lấy danh sách xe của driver hiện tại
     * GET /api/vehicles/my-vehicles
     */
    @GetMapping("/my-vehicles")
    public ResponseEntity<?> getMyVehicles(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Authentication required"));
            }

            String username = userDetails.getUsername();

            Optional<Driver> driverOpt = driverService.findByUsername(username);
            if (driverOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Driver not found"));
            }

            Driver driver = driverOpt.get();
            List<Vehicle> vehicles = vehicleService.findByDriverId(driver.getId());

            List<VehicleResponse> vehicleResponses = vehicles.stream()
                    .map(v -> VehicleResponse.builder()
                            .id(v.getId())
                            .licensePlate(v.getLicensePlate())
                            .brand(v.getBrand())
                            .model(v.getModel())
                            .chargingPort(v.getChargingPort())
                            .batteryCapacity(v.getBatteryCapacity())
                            .driverId(driver.getId())
                            .driverName(driver.getAccount().getUsername())
                            .build())
                    .toList();

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("vehicles", vehicleResponses);
            responseData.put("totalVehicles", vehicles.size());
            responseData.put("remainingSlots", MAX_VEHICLES_PER_DRIVER - vehicles.size());

            return ResponseEntity.ok(ApiResponse.success("Vehicles retrieved successfully", responseData));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving vehicles: " + e.getMessage()));
        }
    }

    /**
     * Lấy thông tin chi tiết một xe
     * GET /api/vehicles/{vehicleId}
     */
    @GetMapping("/{vehicleId}")
    public ResponseEntity<?> getVehicleById(
            @PathVariable Integer vehicleId,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Authentication required"));
            }

            String username = userDetails.getUsername();

            Optional<Vehicle> vehicleOpt = vehicleService.findById(vehicleId);
            if (vehicleOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Vehicle not found"));
            }

            Vehicle vehicle = vehicleOpt.get();

            // Kiểm tra quyền: chỉ driver sở hữu mới xem được
            if (!vehicle.getDriver().getAccount().getUsername().equals(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("You don't have permission to view this vehicle"));
            }

            VehicleResponse vehicleResponse = VehicleResponse.builder()
                    .id(vehicle.getId())
                    .licensePlate(vehicle.getLicensePlate())
                    .brand(vehicle.getBrand())
                    .model(vehicle.getModel())
                    .chargingPort(vehicle.getChargingPort())
                    .batteryCapacity(vehicle.getBatteryCapacity())
                    .driverId(vehicle.getDriver().getId())
                    .driverName(vehicle.getDriver().getAccount().getUsername())
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Vehicle retrieved successfully", vehicleResponse));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving vehicle: " + e.getMessage()));
        }
    }

    /**
     * Cập nhật thông tin xe
     * PUT /api/vehicles/{vehicleId}
     */
    @PutMapping("/{vehicleId}")
    public ResponseEntity<?> updateVehicle(
            @PathVariable Integer vehicleId,
            @Valid @RequestBody VehicleRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Authentication required"));
            }

            String username = userDetails.getUsername();

            Optional<Vehicle> vehicleOpt = vehicleService.findById(vehicleId);
            if (vehicleOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Vehicle not found"));
            }

            Vehicle vehicle = vehicleOpt.get();

            // Kiểm tra quyền
            if (!vehicle.getDriver().getAccount().getUsername().equals(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("You don't have permission to update this vehicle"));
            }

            // Nếu thay đổi biển số, kiểm tra trùng lặp
            if (!vehicle.getLicensePlate().equals(request.getLicensePlate())) {
                if (vehicleService.existsByLicensePlate(request.getLicensePlate())) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(ApiResponse.error("License plate already exists"));
                }
            }

            // Cập nhật thông tin
            vehicle.setLicensePlate(request.getLicensePlate());
            vehicle.setBrand(request.getBrand());
            vehicle.setModel(request.getModel());
            vehicle.setChargingPort(request.getChargingPort());
            vehicle.setBatteryCapacity(request.getBatteryCapacity());

            Vehicle updatedVehicle = vehicleService.save(vehicle);

            VehicleResponse vehicleResponse = VehicleResponse.builder()
                    .id(updatedVehicle.getId())
                    .licensePlate(updatedVehicle.getLicensePlate())
                    .brand(updatedVehicle.getBrand())
                    .model(updatedVehicle.getModel())
                    .chargingPort(updatedVehicle.getChargingPort())
                    .batteryCapacity(updatedVehicle.getBatteryCapacity())
                    .driverId(updatedVehicle.getDriver().getId())
                    .driverName(updatedVehicle.getDriver().getAccount().getUsername())
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Vehicle updated successfully", vehicleResponse));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error updating vehicle: " + e.getMessage()));
        }
    }

    /**
     * Xóa xe
     * DELETE /api/vehicles/{vehicleId}
     */
    @DeleteMapping("/{vehicleId}")
    public ResponseEntity<?> deleteVehicle(
            @PathVariable Integer vehicleId,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Authentication required"));
            }

            String username = userDetails.getUsername();

            Optional<Vehicle> vehicleOpt = vehicleService.findById(vehicleId);
            if (vehicleOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Vehicle not found"));
            }

            Vehicle vehicle = vehicleOpt.get();

            // Kiểm tra quyền
            if (!vehicle.getDriver().getAccount().getUsername().equals(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("You don't have permission to delete this vehicle"));
            }

            vehicleService.deleteById(vehicleId);

            return ResponseEntity.ok(ApiResponse.success("Vehicle deleted successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error deleting vehicle: " + e.getMessage()));
        }
    }
}