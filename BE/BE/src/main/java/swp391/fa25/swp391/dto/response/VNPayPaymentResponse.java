package swp391.fa25.swp391.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VNPayPaymentResponse {
    private String paymentUrl;
    private String transactionId;
    private String message;
    private boolean success;
}
