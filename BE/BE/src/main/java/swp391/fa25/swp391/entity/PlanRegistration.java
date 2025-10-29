package swp391.fa25.swp391.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Entity quản lý việc đăng ký gói subscription của Driver
 * UPDATED: Thêm QR code và payment tracking fields
 */
@Entity
@Table(name = "PLAN_REGISTRATION")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "REG_ID")
    private Integer id;

    @Column(name = "START_DATE")
    private LocalDate startDate;

    @Column(name = "END_DATE")
    private LocalDate endDate;

    @Nationalized
    @Column(name = "STATUS", length = 50)
    private String status; // PENDING, ACTIVE, EXPIRED, CANCELLED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DRIVER_ID")
    private Driver driver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PLAN_ID")
    private SubscriptionPlan plan;

    // ==================== QR CODE FIELDS ====================

    /**
     * Mã QR unique cho subscription này
     * Format: SUB-{registrationId}-{timestamp}-{signature}
     * VD: SUB-123-1698765432-A1B2C3D4
     */
    @Column(name = "QR_CODE", unique = true, length = 255)
    private String qrCode;

    /**
     * Thời gian QR code được tạo
     */
    @Column(name = "QR_GENERATED_AT")
    private Instant qrGeneratedAt;

    /**
     * Số lần QR code đã được scan (tracking usage)
     */
    @Column(name = "QR_SCAN_COUNT")
    private Integer qrScanCount;

    /**
     * Lần scan cuối cùng
     */
    @Column(name = "LAST_SCANNED_AT")
    private Instant lastScannedAt;

    // ==================== PAYMENT FIELDS ====================

    /**
     * Trạng thái thanh toán: PENDING, PAID, FAILED, REFUNDED
     */
    @Nationalized
    @Column(name = "PAYMENT_STATUS", length = 50)
    private String paymentStatus;

    /**
     * Phương thức thanh toán: VNPAY, MOMO, CASH, BANK_TRANSFER
     */
    @Nationalized
    @Column(name = "PAYMENT_METHOD", length = 50)
    private String paymentMethod;

    /**
     * Transaction ID từ payment gateway
     */
    @Column(name = "PAYMENT_TRANSACTION_ID", length = 255)
    private String paymentTransactionId;

    /**
     * Số tiền đã thanh toán (có thể khác giá gốc nếu có discount)
     */
    @Column(name = "TOTAL_AMOUNT", precision = 10, scale = 2)
    private BigDecimal totalAmount;

    /**
     * Ngày thanh toán thành công
     */
    @Column(name = "PAID_DATE")
    private Instant paidDate;

    /**
     * Ngày tạo record
     */
    @Column(name = "CREATED_AT")
    private Instant createdAt;

    // ==================== LIFECYCLE CALLBACKS ====================

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.qrScanCount = 0;

        if (this.paymentStatus == null) {
            this.paymentStatus = "PENDING";
        }

        if (this.status == null) {
            this.status = "PENDING";
        }
    }

    // ==================== HELPER METHODS ====================

    /**
     * Kiểm tra subscription còn active không
     */
    public boolean isActive() {
        return "ACTIVE".equals(this.status)
                && this.endDate != null
                && this.endDate.isAfter(LocalDate.now());
    }

    /**
     * Kiểm tra đã thanh toán chưa
     */
    public boolean isPaid() {
        return "PAID".equals(this.paymentStatus);
    }

    /**
     * Tăng số lần scan QR
     */
    public void incrementScanCount() {
        this.qrScanCount = (this.qrScanCount == null ? 0 : this.qrScanCount) + 1;
        this.lastScannedAt = Instant.now();
    }

    /**
     * Kiểm tra subscription đã hết hạn chưa
     */
    public boolean isExpired() {
        return this.endDate != null && this.endDate.isBefore(LocalDate.now());
    }
    public void activate() {
        this.status = "ACTIVE";
        this.paymentStatus = "PAID";
        this.paidDate = Instant.now();

        // Set start/end date nếu chưa có
        if (this.startDate == null) {
            this.startDate = LocalDate.now();
        }

        // Chỗ này gọi hàm getDurationDays() mà bạn vừa sửa ở bước trước
        if (this.endDate == null && this.plan != null) {
            this.endDate = this.startDate.plusDays(this.plan.getDurationDays());
        }
    }
}