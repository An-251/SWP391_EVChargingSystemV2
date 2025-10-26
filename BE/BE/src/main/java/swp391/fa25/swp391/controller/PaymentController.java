package swp391.fa25.swp391.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.PayInvoiceRequest;
import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.dto.response.PaymentResponse;
import swp391.fa25.swp391.entity.Invoice;
import swp391.fa25.swp391.service.PaymentService;

/**
 * Controller xử lý thanh toán
 * Hiện tại: API đơn giản, FE chỉ cần nhấn nút "Thanh toán"
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;


    public static PaymentResponse fromInvoice(Invoice invoice) {
        return PaymentResponse.builder()
                .invoiceId(invoice.getId())
                .status(invoice.getStatus())
                .amount(invoice.getTotalCost())
                .paymentMethod(invoice.getPaymentMethod())
                .paymentReference(invoice.getPaymentReference())
                .paidDate(invoice.getPaidDate())
                .message("Thanh toán thành công!")
                .build();
    }
//----------------------------------------------------------------------
    /**
     * ⭐ API thanh toán invoice
     * FE chỉ cần gọi với invoiceId và paymentMethod
     */
    @PostMapping("/pay")
    public ResponseEntity<?> payInvoice(@RequestBody PayInvoiceRequest request) {
        try {
            Invoice paidInvoice = paymentService.payInvoice(
                    request.getInvoiceId(),
                    request.getPaymentMethod()
            );

            // SỬA LỖI: Gọi phương thức static qua tên class của nó
            return ResponseEntity.ok(ApiResponse.success(
                    "Thanh toán thành công",
                    PaymentController.fromInvoice(paidInvoice)
            ));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Lỗi thanh toán: " + e.getMessage()));
        }
    }
//----------------------------------------------------------------------
    /**
     * Kiểm tra invoice có quá hạn không
     */
    @GetMapping("/check-overdue/{invoiceId}")
    public ResponseEntity<?> checkOverdue(@PathVariable Integer invoiceId) {
        try {
            boolean isOverdue = paymentService.isInvoiceOverdue(invoiceId);
            return ResponseEntity.ok(ApiResponse.success("Check completed", isOverdue));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}