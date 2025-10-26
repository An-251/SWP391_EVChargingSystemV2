package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import swp391.fa25.swp391.entity.Invoice;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;

/**
 * Service đơn giản để tạo QR Code string
 * Không tích hợp payment gateway thực tế
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class QRCodeService {

    private static final String APP_NAME = "EV_CHARGING";
    private static final String SECRET_KEY = "YOUR_SECRET_KEY_HERE"; // Thay đổi trong production

    /**
     * Tạo QR code data string cho invoice
     * Format: APP_NAME|INVOICE_ID|AMOUNT|TIMESTAMP|CHECKSUM
     */
    public String generateQRCodeForInvoice(Invoice invoice) {
        log.info("Generating QR code for invoice {}", invoice.getId());

        try {
            String invoiceId = String.valueOf(invoice.getId());
            String amount = invoice.getTotalCost().toPlainString();
            String timestamp = String.valueOf(Instant.now().getEpochSecond());

            // Tạo checksum để verify
            String checksum = generateChecksum(invoiceId, amount, timestamp);

            // Format QR data
            String qrData = String.format("%s|INV-%s|%s|%s|%s",
                    APP_NAME,
                    invoiceId,
                    amount,
                    timestamp,
                    checksum
            );

            // Encode base64 để dễ scan
            String encodedQR = Base64.getEncoder().encodeToString(
                    qrData.getBytes(StandardCharsets.UTF_8)
            );

            log.info("Generated QR code for invoice {}: {}", invoice.getId(), encodedQR);
            return encodedQR;

        } catch (Exception e) {
            log.error("Error generating QR code for invoice {}", invoice.getId(), e);
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    /**
     * Verify QR code khi payment callback
     */
    public boolean verifyQRCode(String qrCode, String invoiceId, BigDecimal amount) {
        try {
            // Decode base64
            String decoded = new String(
                    Base64.getDecoder().decode(qrCode),
                    StandardCharsets.UTF_8
            );

            // Parse QR data
            String[] parts = decoded.split("\\|");
            if (parts.length != 5) {
                log.warn("Invalid QR code format");
                return false;
            }

            String qrInvoiceId = parts[1].replace("INV-", "");
            String qrAmount = parts[2];
            String qrTimestamp = parts[3];
            String qrChecksum = parts[4];

            // Verify invoice ID
            if (!qrInvoiceId.equals(invoiceId)) {
                log.warn("Invoice ID mismatch: {} vs {}", qrInvoiceId, invoiceId);
                return false;
            }

            // Verify amount
            if (!new BigDecimal(qrAmount).equals(amount)) {
                log.warn("Amount mismatch");
                return false;
            }

            // Verify checksum
            String expectedChecksum = generateChecksum(qrInvoiceId, qrAmount, qrTimestamp);
            if (!qrChecksum.equals(expectedChecksum)) {
                log.warn("Checksum mismatch");
                return false;
            }

            // Verify timestamp (QR valid for 24 hours)
            long qrTime = Long.parseLong(qrTimestamp);
            long now = Instant.now().getEpochSecond();
            if (now - qrTime > 86400) { // 24 hours
                log.warn("QR code expired");
                return false;
            }

            return true;

        } catch (Exception e) {
            log.error("Error verifying QR code", e);
            return false;
        }
    }

    /**
     * Generate checksum using SHA-256
     */
    private String generateChecksum(String invoiceId, String amount, String timestamp) {
        try {
            String data = invoiceId + amount + timestamp + SECRET_KEY;
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));

            // Convert to hex string (take first 16 chars)
            StringBuilder hexString = new StringBuilder();
            for (int i = 0; i < Math.min(8, hash.length); i++) {
                String hex = Integer.toHexString(0xff & hash[i]);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }

            return hexString.toString();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate checksum", e);
        }
    }

    /**
     * Parse QR code để lấy thông tin (dùng cho display)
     */
    public QRCodeInfo parseQRCode(String qrCode) {
        try {
            String decoded = new String(
                    Base64.getDecoder().decode(qrCode),
                    StandardCharsets.UTF_8
            );

            String[] parts = decoded.split("\\|");
            if (parts.length != 5) {
                throw new RuntimeException("Invalid QR code format");
            }

            return QRCodeInfo.builder()
                    .appName(parts[0])
                    .invoiceId(parts[1].replace("INV-", ""))
                    .amount(new BigDecimal(parts[2]))
                    .timestamp(Long.parseLong(parts[3]))
                    .checksum(parts[4])
                    .build();

        } catch (Exception e) {
            log.error("Error parsing QR code", e);
            throw new RuntimeException("Failed to parse QR code", e);
        }
    }

    /**
     * Check if QR code is expired
     */
    public boolean isQRCodeExpired(String qrCode) {
        try {
            QRCodeInfo info = parseQRCode(qrCode);
            long now = Instant.now().getEpochSecond();
            return (now - info.getTimestamp()) > 86400; // 24 hours
        } catch (Exception e) {
            return true;
        }
    }

    /**
     * Inner class chứa thông tin QR code
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class QRCodeInfo {
        private String appName;
        private String invoiceId;
        private BigDecimal amount;
        private Long timestamp;
        private String checksum;
    }
}