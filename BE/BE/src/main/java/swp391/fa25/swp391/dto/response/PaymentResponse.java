package swp391.fa25.swp391.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResponse {
    private Integer invoiceId;
    private String status;
    private java.math.BigDecimal amount;
    private String paymentMethod;
    private String paymentReference;
    private java.time.Instant paidDate;
    private String message;


}