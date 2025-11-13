package swp391.fa25.swp391.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * DTO (Data Transfer Object) này dùng để trả về thông tin chi tiết
 * của một lượt đăng ký gói dịch vụ cho client.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanRegistrationResponse {
    private Integer registrationId;
    private String planName;
    private String planType;  // BASIC, STANDARD, PREMIUM
    private BigDecimal discountRate; // Tỷ lệ giảm giá (0-100)
    private String description; // Mô tả gói
    private String startDate; // Trả về dạng String đã định dạng (dd/MM/yyyy)
    private String endDate;   // Trả về dạng String đã định dạng (dd/MM/yyyy)
    private String status;    // ACTIVE, CANCELLED, EXPIRED
    private BigDecimal totalPaid;
    private String message;   // Thông báo cho người dùng (VD: "Đăng ký thành công!")

    // Tùy chọn: URL để chuyển hướng người dùng đến trang thanh toán
    private String paymentUrl;
}
