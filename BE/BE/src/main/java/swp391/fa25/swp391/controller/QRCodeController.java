package swp391.fa25.swp391.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.response.QRCodeResponse;
import swp391.fa25.swp391.entity.Invoice;
import swp391.fa25.swp391.service.InvoiceService;
import swp391.fa25.swp391.service.QRCodeService;

/**
 * Controller xử lý QR code generation và verification
 */
@RestController
@RequestMapping("/api/qr")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class QRCodeController {

    private final QRCodeService qrCodeService;
    private final InvoiceService invoiceService;

    /**
     * API để lấy QR code cho invoice
     */
    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<QRCodeResponse> getInvoiceQRCode(@PathVariable Integer invoiceId) {
        Invoice invoice = invoiceService.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceId));

        // Kiểm tra invoice đã thanh toán chưa
        if ("PAID".equals(invoice.getStatus())) {
            return ResponseEntity.badRequest()
                    .body(QRCodeResponse.builder()
                            .success(false)
                            .message("Hóa đơn đã được thanh toán")
                            .build());
        }

        // Generate QR code nếu chưa có hoặc đã expired
        String qrCode;
        if (invoice.getQrCode() == null || qrCodeService.isQRCodeExpired(invoice.getQrCode())) {
            qrCode = qrCodeService.generateQRCodeForInvoice(invoice);

            // Lưu QR code vào invoice
            invoice.setQrCode(qrCode);
            invoiceService.save(invoice);
        } else {
            qrCode = invoice.getQrCode();
        }

        // Parse QR info để hiển thị
        QRCodeService.QRCodeInfo qrInfo = qrCodeService.parseQRCode(qrCode);

        return ResponseEntity.ok(QRCodeResponse.builder()
                .success(true)
                .qrCode(qrCode)
                .invoiceId(invoice.getId())
                .amount(invoice.getTotalCost())
                .driverId(invoice.getDriver().getId())
                .driverName(invoice.getDriver().getAccount().getFullName())
                .dueDate(invoice.getDueDate())
                .message("Quét mã QR để thanh toán")
                .expiresAt(qrInfo.getTimestamp() + 86400) // +24 hours
                .build());
    }

    /**
     * API để verify QR code (gọi từ mobile app sau khi scan)
     */
    @PostMapping("/verify")
    public ResponseEntity<QRCodeResponse> verifyQRCode(@RequestBody VerifyQRRequest request) {
        try {
            // Parse QR code
            QRCodeService.QRCodeInfo qrInfo = qrCodeService.parseQRCode(request.getQrCode());

            // Get invoice
            Invoice invoice = invoiceService.findById(Integer.parseInt(qrInfo.getInvoiceId()))
                    .orElseThrow(() -> new RuntimeException("Invoice not found"));

            // Verify QR code
            boolean isValid = qrCodeService.verifyQRCode(
                    request.getQrCode(),
                    qrInfo.getInvoiceId(),
                    invoice.getTotalCost()
            );

            if (!isValid) {
                return ResponseEntity.badRequest()
                        .body(QRCodeResponse.builder()
                                .success(false)
                                .message("Mã QR không hợp lệ hoặc đã hết hạn")
                                .build());
            }

            // Check invoice status
            if ("PAID".equals(invoice.getStatus())) {
                return ResponseEntity.badRequest()
                        .body(QRCodeResponse.builder()
                                .success(false)
                                .message("Hóa đơn đã được thanh toán")
                                .build());
            }

            return ResponseEntity.ok(QRCodeResponse.builder()
                    .success(true)
                    .qrCode(request.getQrCode())
                    .invoiceId(invoice.getId())
                    .amount(invoice.getTotalCost())
                    .driverId(invoice.getDriver().getId())
                    .driverName(invoice.getDriver().getAccount().getFullName())
                    .message("Mã QR hợp lệ. Tiến hành thanh toán.")
                    .build());

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(QRCodeResponse.builder()
                            .success(false)
                            .message("Lỗi xác thực QR: " + e.getMessage())
                            .build());
        }
    }

    /**
     * API giả lập thanh toán (mock payment)
     * Trong thực tế, endpoint này sẽ do payment gateway gọi
     */
    @PostMapping("/mock-payment")
    public ResponseEntity<QRCodeResponse> mockPayment(@RequestBody MockPaymentRequest request) {
        try {
            // Parse QR code
            QRCodeService.QRCodeInfo qrInfo = qrCodeService.parseQRCode(request.getQrCode());

            // Verify QR
            Invoice invoice = invoiceService.findById(Integer.parseInt(qrInfo.getInvoiceId()))
                    .orElseThrow(() -> new RuntimeException("Invoice not found"));

            boolean isValid = qrCodeService.verifyQRCode(
                    request.getQrCode(),
                    qrInfo.getInvoiceId(),
                    invoice.getTotalCost()
            );

            if (!isValid) {
                return ResponseEntity.badRequest()
                        .body(QRCodeResponse.builder()
                                .success(false)
                                .message("Mã QR không hợp lệ")
                                .build());
            }

            // Update invoice status
            invoice.setStatus("PAID");
            invoice.setPaidDate(java.time.Instant.now());
            invoice.setPaymentReference("MOCK-" + System.currentTimeMillis());
            invoiceService.save(invoice);

            // Reactivate account if suspended
            if ("SUSPENDED".equals(invoice.getDriver().getAccount().getStatus())) {
                invoice.getDriver().getAccount().setStatus("ACTIVE");
            }

            return ResponseEntity.ok(QRCodeResponse.builder()
                    .success(true)
                    .invoiceId(invoice.getId())
                    .amount(invoice.getTotalCost())
                    .message("Thanh toán thành công!")
                    .transactionId(invoice.getPaymentReference())
                    .build());

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(QRCodeResponse.builder()
                            .success(false)
                            .message("Thanh toán thất bại: " + e.getMessage())
                            .build());
        }
    }

    // ==================== REQUEST DTOs ====================

    @lombok.Data
    public static class VerifyQRRequest {
        private String qrCode;
    }

    @lombok.Data
    public static class MockPaymentRequest {
        private String qrCode;
        private String paymentMethod; // CASH, CARD, BANK_TRANSFER
    }
}