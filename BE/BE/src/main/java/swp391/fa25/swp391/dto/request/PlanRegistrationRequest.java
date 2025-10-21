package swp391.fa25.swp391.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) này dùng để nhận dữ liệu từ client
 * khi một tài xế muốn đăng ký một gói dịch vụ mới.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanRegistrationRequest {

    @NotNull(message = "Plan ID không được để trống")
    private Integer planId;

    @NotNull(message = "Driver ID không được để trống")
    private Integer driverId;

    // Tùy chọn: Phương thức thanh toán, có thể được sử dụng sau này
    private String paymentMethod; // VNPAY, MOMO, BANKING, WALLET
}
