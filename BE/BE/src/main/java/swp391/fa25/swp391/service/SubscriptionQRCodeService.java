package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import swp391.fa25.swp391.entity.PlanRegistration;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;

/**
 * Service xử lý QR code cho Subscription Plans (Membership Pass)
 * Format: SUB-{registrationId}-{timestamp}-{signature}
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionQRCodeService {

    // ⭐ Lấy secret key từ application.properties
    @Value("${qr.secret.key:YOUR_SECRET_KEY_CHANGE_IN_PRODUCTION}")
    private String secretKey;

    private static final String HMAC_ALGORITHM = "HmacSHA256";

    /**
     * ⭐ [Phase 2] Generate QR code cho subscription registration
     */
    public String generateQRCodeForSubscription(PlanRegistration registration) {
        try {
            Long timestamp = Instant.now().getEpochSecond();
            String registrationId = registration.getId().toString();
            String driverId = registration.getDriver().getId().toString();

            // Dữ liệu ký: registrationId|driverId|timestamp
            String dataToSign = String.format("%s|%s|%d", registrationId, driverId, timestamp);
            String signature = generateHMAC(dataToSign);

            // Format QR: SUB-{registrationId}-{timestamp}-{signature}
            String qrCode = String.format("SUB-%s-%d-%s", registrationId, timestamp, signature);

            log.info("✅ Generated QR (Membership Pass) for subscription {}: {}", registrationId, qrCode);
            return qrCode;

        } catch (Exception e) {
            log.error(" Lỗi tạo QR code cho subscription {}: {}",
                    registration.getId(), e.getMessage());
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    /**
     * ⭐ [Phase 3] Verify QR code (Quan trọng: check chữ ký)
     *
     * @param qrCode Mã QR từ máy quét
     * @param expectedRegistrationId ID đăng ký (lấy từ DB sau khi parse)
     * @param expectedDriverId ID tài xế (lấy từ DB sau khi parse)
     * @return true nếu hợp lệ
     */
    public boolean verifySubscriptionQRCode(String qrCode, String expectedRegistrationId, String expectedDriverId) {
        try {
            QRCodeInfo qrInfo = parseSubscriptionQRCode(qrCode);

            // 1. Check ID đăng ký
            if (!qrInfo.getRegistrationId().equals(expectedRegistrationId)) {
                log.warn("⚠ QR Mismatch: Registration ID mismatch: expected={}, got={}",
                        expectedRegistrationId, qrInfo.getRegistrationId());
                return false;
            }

            // 2. Tái tạo chữ ký để xác thực
            // Dùng driverId LẤY TỪ DATABASE để tái tạo chữ ký
            String dataToSign = String.format("%s|%s|%d",
                    qrInfo.getRegistrationId(),
                    expectedDriverId,
                    qrInfo.getTimestamp());

            String expectedSignature = generateHMAC(dataToSign);

            // 3. So sánh chữ ký
            if (!expectedSignature.equals(qrInfo.getSignature())) {
                log.warn("️ CRITICAL: Invalid QR signature for registration: {}", expectedRegistrationId);
                return false;
            }

            log.info(" QR code signature verified successfully for registration: {}", expectedRegistrationId);
            return true;

        } catch (Exception e) {
            log.error(" Error verifying QR code: {}", e.getMessage());
            return false;
        }
    }

    /**
     * ⭐ [Phase 3] Parse QR code để lấy thông tin (REG_ID)
     */
    public QRCodeInfo parseSubscriptionQRCode(String qrCode) {
        try {
            // Format: SUB-{registrationId}-{timestamp}-{signature}
            String[] parts = qrCode.split("-", 4);

            if (parts.length != 4 || !"SUB".equals(parts[0])) {
                throw new IllegalArgumentException("Invalid QR code format");
            }

            return QRCodeInfo.builder()
                    .registrationId(parts[1])
                    .timestamp(Long.parseLong(parts[2]))
                    .signature(parts[3])
                    .build();

        } catch (ArrayIndexOutOfBoundsException | NumberFormatException e) {
            log.error(" Error parsing QR code: Invalid format - {}", qrCode);
            throw new IllegalArgumentException("Invalid QR code format", e);
        }
    }

    /**
     * Hàm helper tạo chữ ký HMAC
     */
    private String generateHMAC(String data) throws NoSuchAlgorithmException, InvalidKeyException {
        Mac mac = Mac.getInstance(HMAC_ALGORITHM);
        SecretKeySpec secretKeySpec = new SecretKeySpec(
                secretKey.getBytes(StandardCharsets.UTF_8),
                HMAC_ALGORITHM
        );
        mac.init(secretKeySpec);
        byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

        // Dùng Base64 URL-safe và rút gọn để mã QR ngắn
        String encoded = Base64.getUrlEncoder().withoutPadding().encodeToString(hmacBytes);
        return encoded.substring(0, Math.min(12, encoded.length()));
    }

    // ==================== INNER CLASS ====================
    @lombok.Data
    @lombok.Builder
    public static class QRCodeInfo {
        private String registrationId;
        private Long timestamp;
        private String signature;
    }
}