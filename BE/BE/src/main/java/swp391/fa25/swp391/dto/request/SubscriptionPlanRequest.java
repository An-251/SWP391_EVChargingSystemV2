package swp391.fa25.swp391.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
public class SubscriptionPlanRequest {

    @NotBlank(message = "Plan name is required")
    @Size(max = 255, message = "Plan name cannot exceed 255 characters")
    private String planName;

    @NotBlank(message = "Plan type is required")
    @Size(max = 100, message = "Plan type cannot exceed 100 characters")
    private String planType;

    @NotNull(message = "Price is required")
    @PositiveOrZero(message = "Price must be non-negative")
    private BigDecimal price;

    @NotBlank(message = "Validity days is required")
    @Size(max = 100, message = "Validity days description cannot exceed 100 characters")
    private String validityDays;

    @Size(max = 4000, message = "Description cannot exceed 4000 characters")
    private String description;

    // ⭐ THÊM 2 FIELDS mới
    private Boolean isDefault; // Admin đánh dấu gói Basic

    @PositiveOrZero(message = "Discount rate must be non-negative")
    private BigDecimal discountRate; // Admin nhập % discount (VD: 10 = 10%)
}