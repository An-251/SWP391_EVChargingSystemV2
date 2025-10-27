package swp391.fa25.swp391.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.VerifyQRCodeRequest;
import swp391.fa25.swp391.dto.response.VerifyQRCodeResponse;
import swp391.fa25.swp391.service.PlanRegistrationService;

/**
 * Controller này xử lý việc xác thực QR code (Membership Pass) tại trạm sạc.
 */
@RestController
@RequestMapping("/api/charging/verify")
@RequiredArgsConstructor
public class ChargingVerificationController {

    private final PlanRegistrationService registrationService;

    /**
     * API để trạm sạc/app nhân viên quét và xác thực QR của tài xế
     */
    @PostMapping("/qr")
    public ResponseEntity<VerifyQRCodeResponse> verifySubscriptionByQRCode(
            @Valid @RequestBody VerifyQRCodeRequest request) {

        VerifyQRCodeResponse response = registrationService.verifySubscriptionByQRCode(request.getQrCode());

        if (!response.isValid()) {
            // Trả 400 Bad Request nếu QR không hợp lệ
            return ResponseEntity.badRequest().body(response);
        }

        // Trả 200 OK nếu hợp lệ
        return ResponseEntity.ok(response);
    }
}