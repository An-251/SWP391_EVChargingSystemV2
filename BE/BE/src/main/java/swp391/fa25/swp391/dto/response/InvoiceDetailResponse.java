package swp391.fa25.swp391.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Response DTO chi tiết cho Invoice
 * Bao gồm thông tin payment timeline và status
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDetailResponse {

    // ==================== BASIC INFO ====================
    private Integer invoiceId;
    private String status; // UNPAID, PAID, OVERDUE
    private BigDecimal totalCost;

    // ==================== BILLING PERIOD ====================
    private LocalDate billingStartDate;
    private LocalDate billingEndDate;
    private String billingPeriod; // "01/01/2025 - 31/01/2025"

    // ==================== PAYMENT DATES ====================
    private Instant issueDate; // Ngày tạo invoice
    private Instant dueDate; // Hạn thanh toán (issueDate + 7 days)
    private Instant paidDate; // Ngày thanh toán thực tế (nếu đã trả)

    // ==================== PAYMENT INFO ====================
    private String paymentMethod; // CASH, CARD, BANK_TRANSFER
    private String paymentReference; // Mã giao dịch

    // ==================== DRIVER INFO ====================
    private Integer driverId;
    private String driverName;
    private String driverPhone;
    private String driverEmail;

    // ==================== PLAN INFO ====================
    private Integer planId;
    private String planName;
    private BigDecimal planMonthlyFee;

    // ==================== TIMELINE INFO (for UI) ====================
    /**
     * Số ngày còn lại để thanh toán
     * - Dương: Còn X ngày
     * - 0: Hôm nay là due date
     * - Âm: Quá hạn X ngày
     */
    private Long daysUntilDue;

    /**
     * Số ngày còn lại trước khi bị suspend (grace period)
     * - Dương: Còn X ngày
     * - 0: Hôm nay là suspend date
     * - Âm: Đã bị suspend X ngày trước
     */
    private Long daysUntilSuspension;

    /**
     * Có đang trong grace period không (quá due date nhưng chưa suspend)
     */
    private Boolean inGracePeriod;

    /**
     * Tài khoản có bị suspend không
     */
    private Boolean isAccountSuspended;

    // ==================== USER-FRIENDLY MESSAGES ====================
    private String statusMessage; // "Còn 5 ngày để thanh toán"
    private String warningMessage; // "Tài khoản sẽ bị khóa sau 3 ngày"

    // ==================== QR CODE ====================
    private String qrCode;
    private Boolean qrCodeExpired;
}