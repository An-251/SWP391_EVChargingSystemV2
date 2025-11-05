package swp391.fa25.swp391.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

/**
 * DTO Request cho Admin tạo hóa đơn tổng cho Enterprise
 */
@Data
public class GenerateInvoiceRequest {

    @NotNull(message = "Enterprise ID is required")
    private Integer enterpriseId;

    @NotNull(message = "Billing period start date is required")
    private LocalDate billingPeriodStart;

    @NotNull(message = "Billing period end date is required")
    private LocalDate billingPeriodEnd;
}
