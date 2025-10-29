package swp391.fa25.swp391.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.PayInvoiceRequest;
import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.dto.response.PaymentResponse;
import swp391.fa25.swp391.entity.Invoice;
import swp391.fa25.swp391.service.PaymentService;
import swp391.fa25.swp391.service.IService.IInvoiceService;

/**
 * Controller xử lý thanh toán
 * Updated: Thêm timeline info và payment status checks
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;
    private final IInvoiceService invoiceService;

    /**
     * ⭐ API thanh toán invoice (Updated)
     */
    @PostMapping("/pay")
    public ResponseEntity<?> payInvoice(@RequestBody PayInvoiceRequest request) {
        try {
            Invoice paidInvoice = paymentService.payInvoice(
                    request.getInvoiceId(),
                    request.getPaymentMethod()
            );

            PaymentResponse response = PaymentResponse.builder()
                    .invoiceId(paidInvoice.getId())
                    .status(paidInvoice.getStatus())
                    .amount(paidInvoice.getTotalCost())
                    .paymentMethod(paidInvoice.getPaymentMethod())
                    .paymentReference(paidInvoice.getPaymentReference())
                    .paidDate(paidInvoice.getPaidDate())
                    .message("Thanh toán thành công! " +
                            ("SUSPENDED".equals(paidInvoice.getDriver().getAccount().getStatus())
                                    ? ""
                                    : "Tài khoản đã được kích hoạt lại."))
                    .build();

            return ResponseEntity.ok(ApiResponse.success(
                    "Thanh toán thành công", response));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Lỗi thanh toán: " + e.getMessage()));
        }
    }

    /**
     * ⭐ Kiểm tra invoice có quá hạn không
     */
    @GetMapping("/check-overdue/{invoiceId}")
    public ResponseEntity<?> checkOverdue(@PathVariable Integer invoiceId) {
        try {
            boolean isOverdue = paymentService.isInvoiceOverdue(invoiceId);
            long daysUntilDue = paymentService.getDaysUntilDue(invoiceId);

            String message;
            if (isOverdue) {
                message = String.format("Hóa đơn đã quá hạn %d ngày", Math.abs(daysUntilDue));
            } else if (daysUntilDue == 0) {
                message = "Hôm nay là hạn thanh toán";
            } else {
                message = String.format("Còn %d ngày đến hạn thanh toán", daysUntilDue);
            }

            return ResponseEntity.ok(ApiResponse.success(message,
                    new OverdueCheckResponse(isOverdue, daysUntilDue)));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * ⭐ Kiểm tra invoice có trong grace period không
     */
    @GetMapping("/check-grace-period/{invoiceId}")
    public ResponseEntity<?> checkGracePeriod(@PathVariable Integer invoiceId) {
        try {
            boolean inGracePeriod = paymentService.isInGracePeriod(invoiceId);
            long daysUntilDue = paymentService.getDaysUntilDue(invoiceId);

            String message;
            if (inGracePeriod) {
                long daysOverdue = Math.abs(daysUntilDue);
                long daysUntilSuspend = 7 - daysOverdue; // Grace period = 7 days
                message = String.format(
                        "⚠️ Hóa đơn quá hạn %d ngày. Tài khoản sẽ bị khóa sau %d ngày.",
                        daysOverdue, daysUntilSuspend
                );
            } else if (daysUntilDue < 0) {
                message = "🔒 Tài khoản đã bị khóa do quá hạn thanh toán.";
            } else {
                message = "Hóa đơn chưa quá hạn.";
            }

            return ResponseEntity.ok(ApiResponse.success(message,
                    new GracePeriodCheckResponse(inGracePeriod, daysUntilDue)));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * ⭐ Lấy payment timeline của invoice (for UI progress bar)
     */
    @GetMapping("/timeline/{invoiceId}")
    public ResponseEntity<?> getPaymentTimeline(@PathVariable Integer invoiceId) {
        try {
            Invoice invoice = invoiceService.findById(invoiceId)
                    .orElseThrow(() -> new RuntimeException("Invoice not found"));

            if (invoice.getDueDate() == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invoice has no due date"));
            }

            long daysUntilDue = paymentService.getDaysUntilDue(invoiceId);
            boolean isOverdue = paymentService.isInvoiceOverdue(invoiceId);
            boolean inGracePeriod = paymentService.isInGracePeriod(invoiceId);

            // Calculate days in grace period
            long daysInGracePeriod = 0;
            long daysUntilSuspension = 0;

            if (isOverdue) {
                daysInGracePeriod = Math.abs(daysUntilDue);
                daysUntilSuspension = 7 - daysInGracePeriod;
                if (daysUntilSuspension < 0) daysUntilSuspension = 0;
            }

            PaymentTimeline timeline = PaymentTimeline.builder()
                    .invoiceId(invoice.getId())
                    .status(invoice.getStatus())
                    .issueDate(invoice.getIssueDate())
                    .dueDate(invoice.getDueDate())
                    .paidDate(invoice.getPaidDate())
                    .daysUntilDue(daysUntilDue)
                    .isOverdue(isOverdue)
                    .inGracePeriod(inGracePeriod)
                    .daysInGracePeriod(daysInGracePeriod)
                    .daysUntilSuspension(daysUntilSuspension)
                    .totalGraceDays(7L)
                    .build();

            return ResponseEntity.ok(ApiResponse.success(
                    "Payment timeline retrieved", timeline));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * ⭐ Lấy danh sách invoices cần thanh toán của driver (UNPAID + OVERDUE)
     */
    @GetMapping("/pending/{driverId}")
    public ResponseEntity<?> getPendingPayments(@PathVariable Integer driverId) {
        try {
            var unpaidInvoices = invoiceService.findByDriverIdAndStatus(driverId, "UNPAID");
            var overdueInvoices = invoiceService.findByDriverIdAndStatus(driverId, "OVERDUE");

            var allPending = new java.util.ArrayList<>(unpaidInvoices);
            allPending.addAll(overdueInvoices);

            // Sort by due date (oldest first)
            allPending.sort((i1, i2) -> {
                if (i1.getDueDate() == null) return 1;
                if (i2.getDueDate() == null) return -1;
                return i1.getDueDate().compareTo(i2.getDueDate());
            });

            return ResponseEntity.ok(ApiResponse.success(
                    String.format("Found %d pending invoices", allPending.size()),
                    allPending
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }

    // ==================== DTOs ====================

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class OverdueCheckResponse {
        private Boolean isOverdue;
        private Long daysUntilDue; // Positive: days left, Negative: days overdue
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class GracePeriodCheckResponse {
        private Boolean inGracePeriod;
        private Long daysUntilDue;
    }

    @lombok.Data
    @lombok.Builder
    public static class PaymentTimeline {
        private Integer invoiceId;
        private String status;
        private java.time.Instant issueDate;
        private java.time.Instant dueDate;
        private java.time.Instant paidDate;
        private Long daysUntilDue;
        private Boolean isOverdue;
        private Boolean inGracePeriod;
        private Long daysInGracePeriod;
        private Long daysUntilSuspension;
        private Long totalGraceDays;
    }
}