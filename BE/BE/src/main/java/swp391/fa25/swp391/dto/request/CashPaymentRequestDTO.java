package swp391.fa25.swp391.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CashPaymentRequestDTO {
    private String requestType; // "INVOICE" or "SUBSCRIPTION"
    private Integer referenceId; // Invoice ID or Subscription ID
    private Integer driverId;
    private Integer facilityId;
    private BigDecimal amount; // Required for subscription, optional for invoice
    private String notes;
}
