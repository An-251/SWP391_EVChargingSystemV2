package swp391.fa25.swp391.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class PayInvoiceRequest {
    private Integer invoiceId;
    private String paymentMethod; // CASH, CARD, BANK_TRANSFER
}