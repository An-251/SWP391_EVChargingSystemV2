package swp391.fa25.swp391.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class SubscriptionPlanResponse {

    private Integer id;
    private String planName;
    private String planType;
    private BigDecimal price;
    private String validityDays;
    private String description;
    private Boolean isDefault; // ⭐ THÊM
    private BigDecimal discountRate; // ⭐ THÊM

    private int totalRegistrations; // Số lượng đăng ký liên quan
}