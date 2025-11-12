package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.entity.Account;
import swp391.fa25.swp391.repository.AccountRepository;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationService {

    private final AccountRepository accountRepository;
    private final EmailService emailService;
    
    // Store verification codes in memory (for production, use Redis or database)
    private final Map<String, VerificationData> verificationCodes = new HashMap<>();
    
    private static final int CODE_LENGTH = 6;
    private static final int CODE_EXPIRY_MINUTES = 15;
    
    /**
     * Send verification code to email
     */
    @Transactional
    public void sendVerificationCode(String email) {
        // Check if account exists
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));
        
        // Check if already verified
        if ("active".equalsIgnoreCase(account.getStatus())) {
            throw new RuntimeException("Email already verified");
        }
        
        // Generate 6-digit code
        String code = generateVerificationCode();
        
        // Store code with expiry time
        VerificationData data = new VerificationData(code, Instant.now().plus(CODE_EXPIRY_MINUTES, ChronoUnit.MINUTES));
        verificationCodes.put(email, data);
        
        // Send email
        String htmlContent = buildVerificationEmailTemplate(account.getUsername(), code);
        emailService.sendHtmlEmail(email, "Xác thực tài khoản EVCharging", htmlContent);
        
        log.info("✅ Verification code sent to: {}", email);
    }
    
    /**
     * Verify email with code
     */
    @Transactional
    public void verifyEmail(String email, String code) {
        // Check if code exists
        VerificationData data = verificationCodes.get(email);
        if (data == null) {
            throw new RuntimeException("No verification code found. Please request a new code.");
        }
        
        // Check if code expired
        if (Instant.now().isAfter(data.getExpiryTime())) {
            verificationCodes.remove(email);
            throw new RuntimeException("Verification code expired. Please request a new code.");
        }
        
        // Check if code matches
        if (!data.getCode().equals(code)) {
            throw new RuntimeException("Invalid verification code");
        }
        
        // Update account status to active
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));
        
        account.setStatus("active");
        accountRepository.save(account);
        
        // Remove code after successful verification
        verificationCodes.remove(email);
        
        log.info("✅ Email verified successfully: {}", email);
    }
    
    /**
     * Resend verification code
     */
    public void resendVerificationCode(String email) {
        // Check if account exists
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));
        
        // Check if already verified
        if ("active".equalsIgnoreCase(account.getStatus())) {
            throw new RuntimeException("Email already verified");
        }
        
        // Remove old code if exists
        verificationCodes.remove(email);
        
        // Send new code
        sendVerificationCode(email);
    }
    
    /**
     * Generate random 6-digit verification code
     */
    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 6-digit number
        return String.valueOf(code);
    }
    
    /**
     * Build HTML template for verification email
     */
    private String buildVerificationEmailTemplate(String username, String code) {
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
                    .content { padding: 40px 30px; }
                    .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
                    .code-box { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); }
                    .code { font-size: 48px; font-weight: 700; letter-spacing: 8px; margin: 10px 0; font-family: 'Courier New', monospace; }
                    .expiry { font-size: 14px; color: rgba(255,255,255,0.9); margin-top: 15px; }
                    .instructions { background: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
                    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; color: #92400e; }
                    .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb; }
                    .footer p { margin: 5px 0; }
                    .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✉️ Xác thực Email</h1>
                        <p>Chào mừng bạn đến với EVCharging System</p>
                    </div>
                    
                    <div class="content">
                        <p class="greeting">Xin chào <strong>%s</strong>,</p>
                        <p>Cảm ơn bạn đã đăng ký tài khoản EVCharging! Để hoàn tất quá trình đăng ký, vui lòng xác thực địa chỉ email của bạn.</p>
                        
                        <div class="code-box">
                            <p style="margin: 0; font-size: 16px; opacity: 0.9;">Mã xác thực của bạn là:</p>
                            <div class="code">%s</div>
                            <p class="expiry">⏱️ Mã có hiệu lực trong %d phút</p>
                        </div>
                        
                        <div class="instructions">
                            <p style="margin: 0; font-weight: 600; color: #667eea;">📝 Hướng dẫn:</p>
                            <ol style="margin: 10px 0; padding-left: 20px; color: #4b5563;">
                                <li>Quay lại trang đăng ký</li>
                                <li>Nhập mã xác thực 6 chữ số ở trên</li>
                                <li>Nhấn "Xác thực" để kích hoạt tài khoản</li>
                            </ol>
                        </div>
                        
                        <div class="warning">
                            <strong>⚠️ Lưu ý bảo mật:</strong>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>Không chia sẻ mã này với bất kỳ ai</li>
                                <li>Nhân viên EVCharging sẽ không bao giờ yêu cầu mã của bạn</li>
                                <li>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email</li>
                            </ul>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                            Nếu mã đã hết hạn, bạn có thể yêu cầu gửi lại mã mới từ trang đăng ký.
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
            username,
            code,
            CODE_EXPIRY_MINUTES
        );
    }
    
    /**
     * Inner class to store verification data
     */
    private static class VerificationData {
        private final String code;
        private final Instant expiryTime;
        
        public VerificationData(String code, Instant expiryTime) {
            this.code = code;
            this.expiryTime = expiryTime;
        }
        
        public String getCode() {
            return code;
        }
        
        public Instant getExpiryTime() {
            return expiryTime;
        }
    }
}
