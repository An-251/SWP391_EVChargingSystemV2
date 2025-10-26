package swp391.fa25.swp391.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Response DTO cho QR code operations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QRCodeResponse {

    // Status
    private Boolean success;
    private String message;

    // QR Code data
    private String qrCode;
    private Integer invoiceId;
    private BigDecimal amount;
    private Long expiresAt; // Unix timestamp

    // Driver info
    private Integer driverId;
    private String driverName;

    // Invoice info
    private Instant dueDate;
    private String transactionId;
}