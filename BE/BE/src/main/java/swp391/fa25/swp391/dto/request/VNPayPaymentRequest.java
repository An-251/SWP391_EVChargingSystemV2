package swp391.fa25.swp391.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VNPayPaymentRequest {
    private String paymentType; // "INVOICE" or "SUBSCRIPTION"
    private Integer referenceId; // Invoice ID or Subscription Plan ID
    private Integer driverId;
    private Long amount; // Amount in VND
    private String description;
    private String returnUrl; // Optional custom return URL
}
