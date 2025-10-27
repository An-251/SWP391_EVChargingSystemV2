package swp391.fa25.swp391.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import swp391.fa25.swp391.entity.PlanRegistration; // <-- Phải import entity

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * DTO trả về thông tin chi tiết của một PlanRegistration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanRegistrationResponse {
    // Registration Info
    private Integer id;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;

    // Driver Info
    private Integer driverId;
    private String driverName;

    // Plan Info
    private Integer planId;
    private String planName;

    // Payment Info
    private String paymentStatus;
    private String paymentMethod;
    private BigDecimal totalAmount;
    private Instant paidDate;
    private Instant createdAt;

    // QR Info
    private String qrCode;
    private Integer qrScanCount;

    /**
     * ⭐ [PHẦN QUAN TRỌNG NHẤT]
     * Helper factory method để convert từ Entity sang DTO
     * Đây là hàm mà PlanRegistrationService đang gọi
     */
    public static PlanRegistrationResponse fromEntity(PlanRegistration registration) {
        if (registration == null) {
            return null;
        }

        // Lỗi "báo đỏ" trước đó là do các hàm get() ở đây:
        return PlanRegistrationResponse.builder()
                .id(registration.getId())
                .status(registration.getStatus())
                .startDate(registration.getStartDate())
                .endDate(registration.getEndDate())

                .driverId(registration.getDriver() != null ? registration.getDriver().getId() : null)
                .driverName(registration.getDriver() != null && registration.getDriver().getAccount() != null
                        ? registration.getDriver().getAccount().getFullName() : null)

                .planId(registration.getPlan() != null ? registration.getPlan().getId() : null)
                .planName(registration.getPlan() != null ? registration.getPlan().getPlanName() : null)

                .paymentStatus(registration.getPaymentStatus())
                .paymentMethod(registration.getPaymentMethod())
                .totalAmount(registration.getTotalAmount())
                .paidDate(registration.getPaidDate())
                .createdAt(registration.getCreatedAt())

                .qrCode(registration.getQrCode())
                .qrScanCount(registration.getQrScanCount())

                .build();
    }
}