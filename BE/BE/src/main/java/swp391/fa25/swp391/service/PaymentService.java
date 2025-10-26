package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.entity.Account;
import swp391.fa25.swp391.entity.Invoice;
import swp391.fa25.swp391.repository.AccountRepository;
import swp391.fa25.swp391.repository.InvoiceRepository;

import java.time.Instant;

/**
 * Service xử lý thanh toán invoice
 * Hiện tại: chỉ cần API đơn giản, chưa có QR/MoMo
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final InvoiceRepository invoiceRepository;
    private final AccountRepository accountRepository;

    /**
     * ⭐ Thanh toán invoice (giả lập - chỉ cần nhấn nút)
     */
    @Transactional
    public Invoice payInvoice(Integer invoiceId, String paymentMethod) {
        log.info("Processing payment for invoice {}", invoiceId);

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceId));

        // Check invoice đã thanh toán chưa
        if ("PAID".equals(invoice.getStatus())) {
            throw new RuntimeException("Hóa đơn đã được thanh toán");
        }

        // Update invoice
        invoice.setStatus("PAID");
        invoice.setPaidDate(Instant.now());
        invoice.setPaymentMethod(paymentMethod); // CASH, CARD, BANK_TRANSFER, etc.
        invoice.setPaymentReference("PAY-" + System.currentTimeMillis()); // Mock reference

        Invoice savedInvoice = invoiceRepository.save(invoice);

        // ⭐ Reactivate account nếu bị suspend
        Account account = invoice.getDriver().getAccount();
        if ("SUSPENDED".equals(account.getStatus())) {
            account.setStatus("ACTIVE");
            accountRepository.save(account);
            log.info("Reactivated account {} after payment", account.getId());
        }

        log.info("Payment completed for invoice {}. Method: {}, Reference: {}",
                invoiceId, paymentMethod, savedInvoice.getPaymentReference());

        return savedInvoice;
    }

    /**
     * Kiểm tra invoice có overdue không
     */
    @Transactional(readOnly = true)
    public boolean isInvoiceOverdue(Integer invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if ("PAID".equals(invoice.getStatus())) {
            return false;
        }

        return invoice.getDueDate() != null &&
                invoice.getDueDate().isBefore(Instant.now());
    }
}