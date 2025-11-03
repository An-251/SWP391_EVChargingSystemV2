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
 * Updated: Thêm notification khi thanh toán thành công
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final InvoiceRepository invoiceRepository;
    private final AccountRepository accountRepository;
    private final NotificationService notificationService;

    /**
     * ⭐ Thanh toán invoice (Updated với Notification)
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
        invoice.setPaymentMethod(paymentMethod);
        invoice.setPaymentReference("PAY-" + System.currentTimeMillis());

        Invoice savedInvoice = invoiceRepository.save(invoice);

        // ⭐ Reactivate account nếu bị suspend
        Account account = invoice.getDriver().getAccount();
        boolean wasReactivated = false;

        if ("SUSPENDED".equals(account.getStatus())) {
            account.setStatus("ACTIVE");
            accountRepository.save(account);
            wasReactivated = true;
            log.info("Reactivated account {} after payment", account.getId());
        }

        // ⭐ GỬI NOTIFICATION
        try {
            notificationService.sendPaymentSuccessNotification(savedInvoice);
            log.info(" Sent payment success notification for invoice {}", invoiceId);
        } catch (Exception e) {
            log.error("Failed to send payment notification for invoice {}", invoiceId, e);
            // Không throw exception - payment đã thành công
        }

        log.info("Payment completed for invoice {}. Method: {}, Reference: {}, Reactivated: {}",
                invoiceId, paymentMethod, savedInvoice.getPaymentReference(), wasReactivated);

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

    /**
     * ⭐ Lấy số ngày còn lại để thanh toán (cho UI)
     */
    @Transactional(readOnly = true)
    public long getDaysUntilDue(Integer invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (invoice.getDueDate() == null) {
            return 0;
        }

        Instant now = Instant.now();
        long seconds = invoice.getDueDate().getEpochSecond() - now.getEpochSecond();
        return seconds / (24 * 60 * 60); // Convert to days
    }

    /**
     * ⭐ Kiểm tra invoice có trong grace period không
     * Grace period: Sau due date nhưng chưa bị suspend
     */
    @Transactional(readOnly = true)
    public boolean isInGracePeriod(Integer invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if ("PAID".equals(invoice.getStatus())) {
            return false;
        }

        if (invoice.getDueDate() == null) {
            return false;
        }

        Instant now = Instant.now();

        // Đã quá due date
        boolean isPastDue = invoice.getDueDate().isBefore(now);

        // Chưa đến ngày suspend (due date + 7 days)
        Instant suspendDate = Instant.ofEpochSecond(
                invoice.getDueDate().getEpochSecond() + (7 * 24 * 60 * 60)
        );
        boolean beforeSuspend = now.isBefore(suspendDate);

        return isPastDue && beforeSuspend && "OVERDUE".equals(invoice.getStatus());
    }
}