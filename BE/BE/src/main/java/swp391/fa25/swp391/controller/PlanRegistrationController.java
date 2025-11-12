package swp391.fa25.swp391.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.PlanRegistrationRequest;
import swp391.fa25.swp391.dto.response.PlanRegistrationResponse;
import swp391.fa25.swp391.service.PlanRegistrationService;

import java.util.List;

/**
 * Controller này xử lý các yêu cầu liên quan đến việc đăng ký và quản lý
 * các gói dịch vụ (subscription plans) từ phía tài xế.
 */
@Slf4j
@RestController
@RequestMapping("/api/driver/subscriptions") // Sử dụng prefix /api/driver để phân biệt API cho tài xế
@RequiredArgsConstructor
public class PlanRegistrationController {

    private final PlanRegistrationService registrationService;

    /**
     * API để tài xế đăng ký một gói dịch vụ mới.
     * Yêu cầu body chứa planId và driverId.
     *
     * @param request DTO chứa thông tin đăng ký.
     * @return Thông tin về kết quả đăng ký.
     */
    @PostMapping("/register")
    public ResponseEntity<PlanRegistrationResponse> registerPlan(
            @Valid @RequestBody PlanRegistrationRequest request) {
        try {
            log.info("📥 [CONTROLLER] Received plan registration request: driverId={}, planId={}", 
                    request.getDriverId(), request.getPlanId());
            
            PlanRegistrationResponse response = registrationService.registerPlan(request);
            
            log.info("✅ [CONTROLLER] Plan registration successful: {}", response.getMessage());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            log.error("❌ [CONTROLLER] Plan registration failed: {}", e.getMessage(), e);
            throw e; // Re-throw để GlobalExceptionHandler xử lý
        }
    }

    /**
     * API để tài xế xem thông tin gói dịch vụ đang hoạt động của mình.
     *
     * @param driverId ID của tài xế được truyền qua query parameter.
     * @return Chi tiết về gói đang hoạt động hoặc thông báo nếu chưa đăng ký.
     */
    @GetMapping("/my-subscription")
    public ResponseEntity<PlanRegistrationResponse> getCurrentSubscription(
            @RequestParam Integer driverId) {
        return ResponseEntity.ok(registrationService.getCurrentSubscription(driverId));
    }

    /**
     * API để tài xế hủy gói dịch vụ đang hoạt động.
     *
     * @param driverId ID của tài xế muốn hủy gói.
     * @return Thông báo xác nhận đã hủy gói thành công.
     */
    @PutMapping("/cancel")
    public ResponseEntity<PlanRegistrationResponse> cancelSubscription(
            @RequestParam Integer driverId) {
        return ResponseEntity.ok(registrationService.cancelSubscription(driverId));
    }

    /**
     * API để tài xế xem lại lịch sử tất cả các gói dịch vụ đã từng đăng ký.
     *
     * @param driverId ID của tài xế.
     * @return Danh sách các gói đã đăng ký (cả active, expired, cancelled).
     */
    @GetMapping("/history")
    public ResponseEntity<List<PlanRegistrationResponse>> getRegistrationHistory(
            @RequestParam Integer driverId) {
        return ResponseEntity.ok(registrationService.getRegistrationHistory(driverId));
    }
}
