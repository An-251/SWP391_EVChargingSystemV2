package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import swp391.fa25.swp391.entity.Driver;
import swp391.fa25.swp391.entity.Invoice;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/**
 * Service để gửi thông báo SMS/Email cho driver
 * Hiện tại: Mock implementation - chỉ log ra console
 * TODO: Tích hợp SMS gateway (Twilio, AWS SNS) và Email service (SendGrid, AWS SES)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    // ==================== INVOICE NOTIFICATIONS ====================

    /**
     * Gửi thông báo khi invoice mới được tạo
     */
    public void sendInvoiceCreatedNotification(Invoice invoice) {
        Driver driver = invoice.getDriver();
        String phone = driver.getAccount().getPhone();
        String email = driver.getAccount().getEmail();
        String driverName = driver.getAccount().getFullName();

        String dueDate = formatInstant(invoice.getDueDate());
        BigDecimal amount = invoice.getTotalCost();

        String message = String.format(
                "Xin chào %s,\n\n" +
                        "Hóa đơn #%d đã được tạo.\n" +
                        "Số tiền: %,d VND\n" +
                        "Hạn thanh toán: %s\n\n" +
                        "Vui lòng thanh toán trước hạn để tiếp tục sử dụng dịch vụ.\n\n" +
                        "Trân trọng,\nEV Charging System",
                driverName,
                invoice.getId(),
                amount.longValue(),
                dueDate
        );

        sendSMS(phone, message);
        sendEmail(email, "Hóa đơn mới - EV Charging", message);

        log.info("✅ Sent invoice created notification to driver {} (Invoice: {})",
                driver.getId(), invoice.getId());
    }

    /**
     * Gửi nhắc nhở trước hạn thanh toán (3 ngày trước due date)
     */
    public void sendPaymentReminderNotification(Invoice invoice) {
        Driver driver = invoice.getDriver();
        String phone = driver.getAccount().getPhone();
        String email = driver.getAccount().getEmail();
        String driverName = driver.getAccount().getFullName();

        String dueDate = formatInstant(invoice.getDueDate());
        BigDecimal amount = invoice.getTotalCost();

        String message = String.format(
                "Xin chào %s,\n\n" +
                        "🔔 NHẮC NHỞ THANH TOÁN\n\n" +
                        "Hóa đơn #%d sắp đến hạn:\n" +
                        "Số tiền: %,d VND\n" +
                        "Hạn thanh toán: %s\n\n" +
                        "Vui lòng thanh toán để tránh gián đoạn dịch vụ.\n\n" +
                        "Trân trọng,\nEV Charging System",
                driverName,
                invoice.getId(),
                amount.longValue(),
                dueDate
        );

        sendSMS(phone, message);
        sendEmail(email, "Nhắc nhở thanh toán - EV Charging", message);

        log.info("⏰ Sent payment reminder to driver {} (Invoice: {})",
                driver.getId(), invoice.getId());
    }

    /**
     * Gửi cảnh báo khi invoice quá hạn
     */
    public void sendOverdueWarningNotification(Invoice invoice) {
        Driver driver = invoice.getDriver();
        String phone = driver.getAccount().getPhone();
        String email = driver.getAccount().getEmail();
        String driverName = driver.getAccount().getFullName();

        String dueDate = formatInstant(invoice.getDueDate());
        BigDecimal amount = invoice.getTotalCost();

        String message = String.format(
                "Xin chào %s,\n\n" +
                        "⚠️ CẢNH BÁO: HÓA ĐƠN QUÁ HẠN\n\n" +
                        "Hóa đơn #%d đã quá hạn thanh toán:\n" +
                        "Số tiền: %,d VND\n" +
                        "Hạn thanh toán: %s\n\n" +
                        "Tài khoản của bạn sẽ bị KHÓA nếu không thanh toán trong 7 ngày tới.\n\n" +
                        "Vui lòng thanh toán ngay để tránh gián đoạn dịch vụ.\n\n" +
                        "Trân trọng,\nEV Charging System",
                driverName,
                invoice.getId(),
                amount.longValue(),
                dueDate
        );

        sendSMS(phone, message);
        sendEmail(email, "⚠️ Cảnh báo: Hóa đơn quá hạn - EV Charging", message);

        log.warn("⚠️ Sent overdue warning to driver {} (Invoice: {})",
                driver.getId(), invoice.getId());
    }

    /**
     * Gửi thông báo khi tài khoản bị suspend
     */
    public void sendAccountSuspendedNotification(Invoice invoice) {
        Driver driver = invoice.getDriver();
        String phone = driver.getAccount().getPhone();
        String email = driver.getAccount().getEmail();
        String driverName = driver.getAccount().getFullName();

        BigDecimal amount = invoice.getTotalCost();

        String message = String.format(
                "Xin chào %s,\n\n" +
                        "🔒 TÀI KHOẢN ĐÃ BỊ KHÓA\n\n" +
                        "Tài khoản của bạn đã bị tạm khóa do chưa thanh toán hóa đơn #%d\n" +
                        "Số tiền: %,d VND\n\n" +
                        "Vui lòng thanh toán ngay để kích hoạt lại tài khoản.\n" +
                        "Sau khi thanh toán, tài khoản sẽ tự động được mở khóa.\n\n" +
                        "Trân trọng,\nEV Charging System",
                driverName,
                invoice.getId(),
                amount.longValue()
        );

        sendSMS(phone, message);
        sendEmail(email, "🔒 Tài khoản bị khóa - EV Charging", message);

        log.error("🔒 Sent account suspended notification to driver {} (Invoice: {})",
                driver.getId(), invoice.getId());
    }

    /**
     * Gửi thông báo khi thanh toán thành công
     */
    public void sendPaymentSuccessNotification(Invoice invoice) {
        Driver driver = invoice.getDriver();
        String phone = driver.getAccount().getPhone();
        String email = driver.getAccount().getEmail();
        String driverName = driver.getAccount().getFullName();

        String paidDate = formatInstant(invoice.getPaidDate());
        BigDecimal amount = invoice.getTotalCost();

        String message = String.format(
                "Xin chào %s,\n\n" +
                        "✅ THANH TOÁN THÀNH CÔNG\n\n" +
                        "Hóa đơn #%d đã được thanh toán:\n" +
                        "Số tiền: %,d VND\n" +
                        "Ngày thanh toán: %s\n" +
                        "Phương thức: %s\n" +
                        "Mã giao dịch: %s\n\n" +
                        "Cảm ơn bạn đã sử dụng dịch vụ!\n\n" +
                        "Trân trọng,\nEV Charging System",
                driverName,
                invoice.getId(),
                amount.longValue(),
                paidDate,
                invoice.getPaymentMethod() != null ? invoice.getPaymentMethod() : "N/A",
                invoice.getPaymentReference() != null ? invoice.getPaymentReference() : "N/A"
        );

        sendSMS(phone, message);
        sendEmail(email, "✅ Thanh toán thành công - EV Charging", message);

        log.info("✅ Sent payment success notification to driver {} (Invoice: {})",
                driver.getId(), invoice.getId());
    }

    // ==================== LOW-LEVEL SEND METHODS ====================

    /**
     * Gửi SMS (Mock implementation)
     * TODO: Tích hợp SMS gateway thực tế
     */
    private void sendSMS(String phoneNumber, String message) {
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            log.warn("Cannot send SMS: phone number is empty");
            return;
        }

        // TODO: Tích hợp SMS gateway (Twilio, AWS SNS, Esendex, etc.)
        // Example với Twilio:
        // twilioClient.sendMessage(phoneNumber, message);

        log.info("📱 [MOCK SMS] Sent to {}: {}", phoneNumber,
                message.substring(0, Math.min(50, message.length())) + "...");
    }

    /**
     * Gửi Email (Mock implementation)
     * TODO: Tích hợp Email service thực tế
     */
    private void sendEmail(String emailAddress, String subject, String body) {
        if (emailAddress == null || emailAddress.isEmpty()) {
            log.warn("Cannot send email: email address is empty");
            return;
        }

        // TODO: Tích hợp Email service (SendGrid, AWS SES, JavaMail, etc.)
        // Example với JavaMail:
        // mailSender.send(emailAddress, subject, body);

        log.info("📧 [MOCK EMAIL] Sent to {}: Subject='{}', Body='{}'",
                emailAddress, subject,
                body.substring(0, Math.min(50, body.length())) + "...");
    }

    // ==================== HELPER METHODS ====================

    /**
     * Format Instant thành string dễ đọc
     */
    private String formatInstant(Instant instant) {
        if (instant == null) {
            return "N/A";
        }
        LocalDateTime dateTime = LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
        return dateTime.format(DATE_FORMATTER);
    }
}