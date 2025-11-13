package swp391.fa25.swp391.service;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Service email đa dụng, hỗ trợ HTML và tên người gửi
 * Dùng cho NotificationService
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.from.address}")
    private String fromAddress;

    @Value("${mail.from.name}")
    private String fromName;

    /**
     * Gửi email dạng Plain Text
     */
    public void sendEmail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            // false = plain text
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setFrom(new InternetAddress(fromAddress, fromName));
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body);

            mailSender.send(message);
            log.info("✅ Email sent successfully to: {}", to);

        } catch (Exception e) {
            log.error("❌ Failed to send email to {}: {}", to, e.getMessage());
            // Ném RuntimeException để nếu cần có thể bắt ở tầng cao hơn (ví dụ @Async)
            throw new RuntimeException("Failed to send email", e);
        }
    }

    /**
     * Gửi email HTML với template đẹp
     */
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            // true = multipart (HTML)
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new InternetAddress(fromAddress, fromName));
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML

            mailSender.send(message);
            log.info("✅ HTML email sent successfully to: {}", to);

        } catch (Exception e) {
            log.error("❌ Failed to send HTML email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send HTML email", e);
        }
    }

    /**
     * Gửi email thông báo hóa đơn
     */
    public void sendInvoiceEmail(String toEmail, swp391.fa25.swp391.entity.Invoice invoice) {
        try {
            String subject = "Hóa đơn sạc xe điện - INV-" + invoice.getId();
            String htmlContent = buildInvoiceEmailTemplate(invoice);
            
            sendHtmlEmail(toEmail, subject, htmlContent);
            log.info("✅ Invoice email sent to: {} for invoice: {}", toEmail, invoice.getId());
            
        } catch (Exception e) {
            log.error("❌ Failed to send invoice email to {}: {}", toEmail, e.getMessage());
            // Don't throw - invoice is still created successfully
        }
    }

    /**
     * Build HTML template for invoice email
     */
    private String buildInvoiceEmailTemplate(swp391.fa25.swp391.entity.Invoice invoice) {
        String driverName = invoice.getDriver().getAccount().getFullName();
        if (driverName == null || driverName.isEmpty()) {
            driverName = invoice.getDriver().getAccount().getUsername();
        }
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
                    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 40px 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
                    .header p { margin: 10px 0 0; font-size: 16px; opacity: 0.9; }
                    .content { padding: 40px 30px; }
                    .greeting { font-size: 16px; color: #333; margin-bottom: 20px; }
                    .invoice-box { background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 10px; padding: 25px; margin: 20px 0; }
                    .invoice-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
                    .invoice-row:last-child { border-bottom: none; padding-top: 20px; margin-top: 10px; border-top: 2px solid #667eea; }
                    .invoice-label { color: #6b7280; font-size: 14px; }
                    .invoice-value { color: #111827; font-weight: 600; font-size: 14px; }
                    .total { font-size: 24px !important; color: #667eea !important; font-weight: 700 !important; }
                    .btn-container { text-align: center; margin: 30px 0; }
                    .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); }
                    .btn:hover { opacity: 0.9; }
                    .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 13px; }
                    .footer p { margin: 5px 0; }
                    .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; }
                    .status-pending { background: #fef3c7; color: #92400e; }
                    .status-paid { background: #d1fae5; color: #065f46; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⚡ Hóa đơn sạc xe điện</h1>
                        <p>Mã hóa đơn: <strong>%s</strong></p>
                    </div>
                    
                    <div class="content">
                        <p class="greeting">Kính gửi <strong>%s</strong>,</p>
                        <p>Hóa đơn sạc xe điện của bạn đã được tạo thành công. Dưới đây là chi tiết:</p>
                        
                        <div class="invoice-box">
                            <div class="invoice-row">
                                <span class="invoice-label">📅 Kỳ hóa đơn:</span>
                                <span class="invoice-value">%s → %s</span>
                            </div>
                            <div class="invoice-row">
                                <span class="invoice-label">🔋 Tổng số session:</span>
                                <span class="invoice-value">%d phiên sạc</span>
                            </div>
                            <div class="invoice-row">
                                <span class="invoice-label">⚡ Tổng năng lượng:</span>
                                <span class="invoice-value">%.2f kWh</span>
                            </div>
                            <div class="invoice-row">
                                <span class="invoice-label">💵 Phí dịch vụ:</span>
                                <span class="invoice-value">%,d đ</span>
                            </div>
                            <div class="invoice-row">
                                <span class="invoice-label">💰 Tổng thanh toán:</span>
                                <span class="invoice-value total">%,d đ</span>
                            </div>
                        </div>
                        
                        <p style="margin: 20px 0;">
                            <strong>Trạng thái:</strong> 
                            <span class="status-badge status-%s">%s</span>
                        </p>
                        
                        <div class="btn-container">
                            <a href="http://localhost:5173/driver/invoices" class="btn">
                                Xem chi tiết hóa đơn
                            </a>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                            📌 <strong>Lưu ý:</strong> Vui lòng thanh toán hóa đơn trước ngày %s để tránh bị gián đoạn dịch vụ.
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p><strong>EVCharging System</strong></p>
                        <p>📧 Email: support@evcharging.com | ☎️ Hotline: 1900-xxxx</p>
                        <p>🌐 Website: evcharging.com</p>
                        <p style="margin-top: 15px; color: #9ca3af;">
                            © 2025 EVCharging System. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """,
            "INV-" + invoice.getId(),
            driverName,
            invoice.getBillingStartDate(),
            invoice.getBillingEndDate(),
            invoice.getSessions() != null ? invoice.getSessions().size() : 0,
            calculateTotalKwh(invoice),
            0, // Service fee (not in entity)
            invoice.getTotalCost() != null ? invoice.getTotalCost().intValue() : 0,
            invoice.getStatus() != null ? invoice.getStatus().toLowerCase() : "unpaid",
            invoice.getStatus() != null ? invoice.getStatus() : "unpaid",
            invoice.getDueDate()
        );
    }

    /**
     * Calculate total kWh from sessions
     */
    private double calculateTotalKwh(swp391.fa25.swp391.entity.Invoice invoice) {
        if (invoice.getSessions() == null || invoice.getSessions().isEmpty()) {
            return 0.0;
        }
        return invoice.getSessions().stream()
                .mapToDouble(session -> session.getKwhUsed() != null ? session.getKwhUsed().doubleValue() : 0.0)
                .sum();
    }

    /**
     * ⭐ Send subscription payment confirmation email
     */
    public void sendSubscriptionPaymentEmail(String toEmail, swp391.fa25.swp391.entity.PlanRegistration registration, String paymentMethod) {
        try {
            String subject = "Xác nhận thanh toán gói đăng ký - " + registration.getPlan().getPlanName();
            String htmlContent = buildSubscriptionPaymentTemplate(registration, paymentMethod);
            
            sendHtmlEmail(toEmail, subject, htmlContent);
            log.info("✅ Subscription payment email sent to: {} for plan: {}", toEmail, registration.getPlan().getPlanName());
            
        } catch (Exception e) {
            log.error("❌ Failed to send subscription payment email to {}: {}", toEmail, e.getMessage());
            // Don't throw - payment is still successful
        }
    }

    /**
     * ⭐ Build HTML template for subscription payment email
     */
    private String buildSubscriptionPaymentTemplate(swp391.fa25.swp391.entity.PlanRegistration registration, String paymentMethod) {
        String driverName = registration.getDriver().getAccount().getFullName();
        if (driverName == null || driverName.isEmpty()) {
            driverName = registration.getDriver().getAccount().getUsername();
        }

        String paymentMethodDisplay = "VNPAY".equalsIgnoreCase(paymentMethod) ? "VNPay" : "Tiền mặt";
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
                    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #10b981 0%%, #059669 100%%); color: white; padding: 40px 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
                    .header p { margin: 10px 0 0; font-size: 16px; opacity: 0.9; }
                    .success-badge { display: inline-block; background: #d1fae5; color: #065f46; padding: 8px 20px; border-radius: 20px; font-weight: 600; margin-top: 15px; }
                    .content { padding: 40px 30px; }
                    .greeting { font-size: 16px; color: #333; margin-bottom: 20px; }
                    .plan-box { background: linear-gradient(135deg, #f0fdf4 0%%, #dcfce7 100%%); border: 2px solid #10b981; border-radius: 10px; padding: 25px; margin: 20px 0; }
                    .plan-name { font-size: 24px; font-weight: 700; color: #065f46; margin-bottom: 15px; text-align: center; }
                    .plan-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #d1fae5; }
                    .plan-row:last-child { border-bottom: none; padding-top: 20px; margin-top: 10px; border-top: 2px solid #10b981; }
                    .plan-label { color: #6b7280; font-size: 14px; }
                    .plan-value { color: #111827; font-weight: 600; font-size: 14px; }
                    .price { font-size: 28px !important; color: #10b981 !important; font-weight: 700 !important; }
                    .features-box { background: #f9fafb; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; }
                    .features-box h3 { margin: 0 0 15px 0; color: #065f46; font-size: 16px; }
                    .feature-item { padding: 8px 0; color: #374151; font-size: 14px; }
                    .feature-item:before { content: '✅ '; margin-right: 8px; }
                    .btn-container { text-align: center; margin: 30px 0; }
                    .btn { display: inline-block; background: linear-gradient(135deg, #10b981 0%%, #059669 100%%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
                    .btn:hover { opacity: 0.9; }
                    .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 13px; }
                    .footer p { margin: 5px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Thanh toán thành công!</h1>
                        <p>Gói đăng ký của bạn đã được kích hoạt</p>
                        <span class="success-badge">✅ Thanh toán đã xác nhận</span>
                    </div>
                    
                    <div class="content">
                        <p class="greeting">Kính gửi <strong>%s</strong>,</p>
                        <p>Cảm ơn bạn đã đăng ký gói dịch vụ. Thanh toán của bạn đã được xử lý thành công!</p>
                        
                        <div class="plan-box">
                            <div class="plan-name">%s</div>
                            <div class="plan-row">
                                <span class="plan-label">📅 Ngày bắt đầu:</span>
                                <span class="plan-value">%s</span>
                            </div>
                            <div class="plan-row">
                                <span class="plan-label">📅 Ngày hết hạn:</span>
                                <span class="plan-value">%s</span>
                            </div>
                            <div class="plan-row">
                                <span class="plan-label">💳 Phương thức thanh toán:</span>
                                <span class="plan-value">%s</span>
                            </div>
                            <div class="plan-row">
                                <span class="plan-label">💰 Số tiền đã thanh toán:</span>
                                <span class="plan-value price">%,d đ</span>
                            </div>
                        </div>
                        
                        <div class="features-box">
                            <h3>🎁 Quyền lợi của gói %s:</h3>
                            <div class="feature-item">Sử dụng dịch vụ sạc xe điện tại hệ thống trạm sạc</div>
                            <div class="feature-item">Được hỗ trợ 24/7 từ đội ngũ chăm sóc khách hàng</div>
                            <div class="feature-item">Theo dõi lịch sử sạc và hóa đơn chi tiết</div>
                            <div class="feature-item">Hưởng ưu đãi dành riêng cho gói %s</div>
                        </div>
                        
                        <div class="btn-container">
                            <a href="http://localhost:5173/driver/subscription" class="btn">
                                Xem chi tiết gói đăng ký
                            </a>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                            📌 <strong>Lưu ý:</strong> Gói đăng ký sẽ tự động hết hạn vào ngày %s. Bạn có thể gia hạn hoặc nâng cấp gói bất cứ lúc nào.
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p><strong>EVCharging System</strong></p>
                        <p>📧 Email: support@evcharging.com | ☎️ Hotline: 1900-xxxx</p>
                        <p>🌐 Website: evcharging.com</p>
                        <p style="margin-top: 15px; color: #9ca3af;">
                            © 2025 EVCharging System. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """,
            driverName,
            registration.getPlan().getPlanName(),
            registration.getStartDate(),
            registration.getEndDate(),
            paymentMethodDisplay,
            registration.getPlan().getPrice() != null ? registration.getPlan().getPrice().intValue() : 0,
            registration.getPlan().getPlanName(),
            registration.getPlan().getPlanName(),
            registration.getEndDate()
        );
    }

    /**
     * ⭐ Send invoice payment confirmation email
     */
    public void sendInvoicePaymentConfirmationEmail(String toEmail, swp391.fa25.swp391.entity.Invoice invoice, String paymentMethod) {
        try {
            String subject = "Xác nhận thanh toán hóa đơn - INV-" + invoice.getId();
            String htmlContent = buildInvoicePaymentConfirmationTemplate(invoice, paymentMethod);
            
            sendHtmlEmail(toEmail, subject, htmlContent);
            log.info("✅ Invoice payment confirmation email sent to: {} for invoice: {}", toEmail, invoice.getId());
            
        } catch (Exception e) {
            log.error("❌ Failed to send invoice payment confirmation email to {}: {}", toEmail, e.getMessage());
            // Don't throw - payment is still successful
        }
    }

    /**
     * ⭐ Build HTML template for invoice payment confirmation email
     */
    private String buildInvoicePaymentConfirmationTemplate(swp391.fa25.swp391.entity.Invoice invoice, String paymentMethod) {
        String driverName = invoice.getDriver().getAccount().getFullName();
        if (driverName == null || driverName.isEmpty()) {
            driverName = invoice.getDriver().getAccount().getUsername();
        }

        String paymentMethodDisplay = "VNPAY".equalsIgnoreCase(paymentMethod) ? "VNPay" : "Tiền mặt";
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
                    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #3b82f6 0%%, #2563eb 100%%); color: white; padding: 40px 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
                    .header p { margin: 10px 0 0; font-size: 16px; opacity: 0.9; }
                    .success-badge { display: inline-block; background: #dbeafe; color: #1e40af; padding: 8px 20px; border-radius: 20px; font-weight: 600; margin-top: 15px; }
                    .content { padding: 40px 30px; }
                    .greeting { font-size: 16px; color: #333; margin-bottom: 20px; }
                    .invoice-box { background: #f0f9ff; border: 2px solid #3b82f6; border-radius: 10px; padding: 25px; margin: 20px 0; }
                    .invoice-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #bfdbfe; }
                    .invoice-row:last-child { border-bottom: none; padding-top: 20px; margin-top: 10px; border-top: 2px solid #3b82f6; }
                    .invoice-label { color: #6b7280; font-size: 14px; }
                    .invoice-value { color: #111827; font-weight: 600; font-size: 14px; }
                    .total { font-size: 24px !important; color: #3b82f6 !important; font-weight: 700 !important; }
                    .paid-stamp { text-align: center; margin: 20px 0; }
                    .paid-stamp img { max-width: 150px; }
                    .paid-text { display: inline-block; background: #10b981; color: white; padding: 12px 30px; border-radius: 8px; font-size: 18px; font-weight: 700; }
                    .btn-container { text-align: center; margin: 30px 0; }
                    .btn { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%%, #2563eb 100%%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
                    .btn:hover { opacity: 0.9; }
                    .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 13px; }
                    .footer p { margin: 5px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Thanh toán thành công!</h1>
                        <p>Hóa đơn: <strong>INV-%s</strong></p>
                        <span class="success-badge">💳 Đã thanh toán</span>
                    </div>
                    
                    <div class="content">
                        <p class="greeting">Kính gửi <strong>%s</strong>,</p>
                        <p>Thanh toán hóa đơn của bạn đã được xử lý thành công. Cảm ơn bạn đã sử dụng dịch vụ!</p>
                        
                        <div class="paid-stamp">
                            <span class="paid-text">✅ ĐÃ THANH TOÁN</span>
                        </div>
                        
                        <div class="invoice-box">
                            <div class="invoice-row">
                                <span class="invoice-label">📅 Kỳ hóa đơn:</span>
                                <span class="invoice-value">%s → %s</span>
                            </div>
                            <div class="invoice-row">
                                <span class="invoice-label">🔋 Tổng số session:</span>
                                <span class="invoice-value">%d phiên sạc</span>
                            </div>
                            <div class="invoice-row">
                                <span class="invoice-label">⚡ Tổng năng lượng:</span>
                                <span class="invoice-value">%.2f kWh</span>
                            </div>
                            <div class="invoice-row">
                                <span class="invoice-label">💳 Phương thức thanh toán:</span>
                                <span class="invoice-value">%s</span>
                            </div>
                            <div class="invoice-row">
                                <span class="invoice-label">📅 Ngày thanh toán:</span>
                                <span class="invoice-value">%s</span>
                            </div>
                            <div class="invoice-row">
                                <span class="invoice-label">💰 Số tiền đã thanh toán:</span>
                                <span class="invoice-value total">%,d đ</span>
                            </div>
                        </div>
                        
                        <div class="btn-container">
                            <a href="http://localhost:5173/driver/invoices" class="btn">
                                Xem chi tiết hóa đơn
                            </a>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                            📌 <strong>Lưu ý:</strong> Email này là xác nhận thanh toán. Vui lòng lưu giữ để làm chứng từ khi cần thiết.
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p><strong>EVCharging System</strong></p>
                        <p>📧 Email: support@evcharging.com | ☎️ Hotline: 1900-xxxx</p>
                        <p>🌐 Website: evcharging.com</p>
                        <p style="margin-top: 15px; color: #9ca3af;">
                            © 2025 EVCharging System. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """,
            invoice.getId(),
            driverName,
            invoice.getBillingStartDate(),
            invoice.getBillingEndDate(),
            invoice.getSessions() != null ? invoice.getSessions().size() : 0,
            calculateTotalKwh(invoice),
            paymentMethodDisplay,
            invoice.getPaidDate() != null ? 
                java.time.LocalDateTime.ofInstant(invoice.getPaidDate(), java.time.ZoneOffset.UTC).format(
                    java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")
                ) : "N/A",
            invoice.getTotalCost() != null ? invoice.getTotalCost().intValue() : 0
        );
    }
}

