package swp391.fa25.swp391.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.PaymentCallbackRequest;
import swp391.fa25.swp391.service.PlanRegistrationService;

/**
 * Controller xử lý callback (IPN) từ Payment Gateway (VNPAY, MoMo)
 */
@RestController
@RequestMapping("/api/payment/callback")
@RequiredArgsConstructor
@Slf4j
public class PaymentCallbackController {

    private final PlanRegistrationService registrationService;
    // TODO: Inject PaymentVerificationService để kiểm tra signature của VNPAY

    /**
     * API này VNPAY/MoMo sẽ gọi khi thanh toán hoàn tất (phiên bản giả lập)
     */
    @PostMapping("/subscription")
    public ResponseEntity<String> handleSubscriptionPaymentCallback(
            @RequestBody PaymentCallbackRequest callback) { // VNPAY thường dùng Query Params

        log.info("Received payment callback for regId: {}", callback.getRegistrationId());

        // TODO: BƯỚC QUAN TRỌNG:
        // 1. Xác thực chữ ký (signature) của VNPAY/MoMo
        //    (Nếu sai, return lỗi ngay)

        // 2. Kiểm tra trạng thái thanh toán
        if (callback.isSuccess()) {
            try {
                // KÍCH HOẠT GÓI VÀ TẠO QR
                registrationService.activateSubscription(
                        callback.getRegistrationId(),
                        callback.getTransactionId(),
                        callback.getPaymentMethod()
                );

                // Phản hồi cho VNPAY/MoMo biết đã nhận thành công
                // (VNPAY yêu cầu: {"RspCode":"00","Message":"Success"})
                return ResponseEntity.ok("{\"RspCode\":\"00\",\"Message\":\"Success\"}");

            } catch (Exception e) {
                log.error("Failed to activate subscription {}: {}",
                        callback.getRegistrationId(), e.getMessage());
                // Báo lỗi để VNPAY/MoMo có thể thử lại
                return ResponseEntity.status(500).body("{\"RspCode\":\"99\",\"Message\":\"Failed\"}");
            }
        } else {
            // Xử lý thanh toán thất bại (cập nhật status FAILED, v.v.)
            log.warn("Payment failed for regId: {}", callback.getRegistrationId());
            return ResponseEntity.badRequest().body("{\"RspCode\":\"02\",\"Message\":\"Payment Failed\"}");
        }
    }
}