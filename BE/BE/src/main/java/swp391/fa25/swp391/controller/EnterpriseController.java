package swp391.fa25.swp391.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.EmpStartSessionRequest; // Đổi tên DTO
import swp391.fa25.swp391.dto.request.EmpStopSessionRequest;  // Đổi tên DTO
import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.dto.response.ChargingSessionResponse; // THÊM IMPORT
import swp391.fa25.swp391.entity.ChargingPoint; // THÊM IMPORT
import swp391.fa25.swp391.entity.ChargingSession;
import swp391.fa25.swp391.entity.Reservation; // THÊM IMPORT
import swp391.fa25.swp391.entity.StationEmployee;
import swp391.fa25.swp391.service.IService.IEnterpriseChargingService;
import swp391.fa25.swp391.service.IService.IStationEmployeeService;

import java.time.Duration; // THÊM IMPORT
import java.time.LocalDateTime; // THÊM IMPORT

@Slf4j
@RestController
@RequestMapping("/api/enterprise/charging")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
// TODO: Cần giới hạn lại quyền truy cập (ví dụ: @PreAuthorize("hasRole('STATION_EMPLOYEE')"))
public class EnterpriseController {

    private final IEnterpriseChargingService enterpriseChargingService;
    private final IStationEmployeeService stationEmployeeService; // Service để tìm Employee

    // ĐÃ XÓA ChargingSessionController

    /**
     * API cho StationEmployee bắt đầu phiên sạc cho xe Enterprise
     */
    @PostMapping("/start")
    public ResponseEntity<?> startEnterpriseCharging(
            @Valid @RequestBody EmpStartSessionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            // Lấy thông tin Employee từ userDetails
            StationEmployee employee = getEmployeeFromDetails(userDetails);

            ChargingSession session = enterpriseChargingService.startEnterpriseSession(request, employee);

            // Gọi hàm mapToResponse nội bộ
            var response = mapToResponse(session);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Enterprise charging session started", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error starting enterprise session", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Internal server error"));
        }
    }

    /**
     * API cho StationEmployee dừng phiên sạc
     */
    @PostMapping("/{sessionId}/stop")
    public ResponseEntity<?> stopEnterpriseCharging(
            @PathVariable Integer sessionId,
            @Valid @RequestBody EmpStopSessionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            // Lấy thông tin Employee từ userDetails
            StationEmployee employee = getEmployeeFromDetails(userDetails);

            ChargingSession session = enterpriseChargingService.stopEnterpriseSession(sessionId, request, employee);

            // Gọi hàm mapToResponse nội bộ
            var response = mapToResponse(session);

            return ResponseEntity.ok(
                    ApiResponse.success("Enterprise charging session stopped", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error stopping enterprise session", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Internal server error"));
        }
    }

    /**
     * Helper tìm Employee (Đã cập nhật logic thật)
     */
    private StationEmployee getEmployeeFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new RuntimeException("Authentication required");
        }
        String username = userDetails.getUsername();

        // Giả sử IStationEmployeeService có hàm findByUsername
        // (Bạn cần implement hàm này giống như cách làm với IAdminService)
        return stationEmployeeService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("StationEmployee account not found for username: " + username));
    }


    // ============================================
    // HELPER METHOD (ĐÃ SAO CHÉP TỪ ChargingSessionController)
    // ============================================

    /**
     * Helper method để chuyển đổi ChargingSession Entity sang ChargingSessionResponse DTO
     */
    private ChargingSessionResponse mapToResponse(ChargingSession session) {
        Long durationMinutes = null;
        Integer chargedPercentage = null;

        if (session.getEndTime() != null && session.getStartTime() != null) {
            durationMinutes = Duration.between(session.getStartTime(), session.getEndTime()).toMinutes();
        }

        if (session.getEndPercentage() != null && session.getStartPercentage() != null) {
            chargedPercentage = session.getEndPercentage() - session.getStartPercentage();
        }

        ChargingPoint cp = session.getChargingPoint();

        // LẤY THÔNG TIN RESERVATION (NẾU CÓ)
        Reservation reservation = session.getReservation();
        Long reservationId = null;
        String chargingType = "WALK-IN"; // Mặc định là sạc trực tiếp
        LocalDateTime reservationStartTime = null;
        LocalDateTime reservationEndTime = null;

        if (reservation != null) {
            reservationId = reservation.getId();
            chargingType = "RESERVATION"; // Sạc qua đặt chỗ
            reservationStartTime = reservation.getStartTime();
            reservationEndTime = reservation.getEndTime();
        }

        // LOGIC XỬ LÝ TÊN (CHO DRIVER HOẶC ENTERPRISE)
        String driverName = "N/A";
        Integer driverId = null;

        if (session.getDriver() != null) {
            // Trường hợp sạc của Driver
            driverName = session.getDriver().getAccount().getFullName();
            driverId = session.getDriver().getId();
        } else if (session.getVehicle() != null && session.getVehicle().getEnterprise() != null) {
            // Trường hợp sạc của Enterprise
            driverName = session.getVehicle().getEnterprise().getCompanyName();
            // driverId vẫn là null
        } else if (session.getVehicle() != null) {
            // Trường hợp xe không rõ chủ (backup)
            driverName = "Vehicle: " + session.getVehicle().getLicensePlate();
        }

        return ChargingSessionResponse.builder()
                .sessionId(session.getId())
                .status(session.getStatus())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .durationMinutes(durationMinutes)
                .overusedTime(session.getOverusedTime())
                .driverId(driverId) // Sẽ là null cho Enterprise
                .driverName(driverName) // Tên Driver hoặc Tên Công ty
                .vehicleId(session.getVehicle().getId())
                .vehicleModel(session.getVehicle().getModel())
                .licensePlate(session.getVehicle().getLicensePlate())
                .chargingPointId(cp.getId())
                .chargingPointName(cp.getPointName())
                .connectorType(cp.getConnectorType())
                .stationName(cp.getStation() != null ? cp.getStation().getStationName() : null)
                .stationAddress(cp.getStation() != null ? cp.getStation().getFacility().getFullAddress() : null)
                .startPercentage(session.getStartPercentage())
                .endPercentage(session.getEndPercentage())
                .chargedPercentage(chargedPercentage)
                .kwhUsed(session.getKwhUsed())
                .cost(session.getCost())
                .reservationId(reservationId)
                .chargingType(chargingType)
                .reservationStartTime(reservationStartTime)
                .reservationEndTime(reservationEndTime)
                .build();
    }
}

