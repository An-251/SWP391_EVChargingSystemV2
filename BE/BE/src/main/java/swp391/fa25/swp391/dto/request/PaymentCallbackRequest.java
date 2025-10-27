package swp391.fa25.swp391.dto.request;

import lombok.Data;

/**
 * DTO này là phiên bản GIẢ LẬP
 * Thực tế bạn sẽ nhận rất nhiều tham số từ VNPAY/MoMo
 */
@Data
public class PaymentCallbackRequest {
    private Integer registrationId; // ID đơn hàng của bạn (vnp_TxnRef)
    private String transactionId;   // ID giao dịch của VNPAY/MoMo (vnp_TransactionNo)
    private String paymentMethod;   // VNPAY, MOMO
    private boolean success;        // Trạng thái thanh toán (vnp_ResponseCode == "00")
    private String signature;       // Chữ ký của VNPAY/MoMo (vnp_SecureHash)
}