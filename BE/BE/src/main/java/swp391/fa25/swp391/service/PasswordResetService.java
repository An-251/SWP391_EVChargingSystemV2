// service/PasswordResetService.java
package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.entity.Account;
import swp391.fa25.swp391.entity.PasswordResetToken;
import swp391.fa25.swp391.repository.PasswordResetTokenRepository;
import swp391.fa25.swp391.service.IService.IAccountService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final IAccountService accountService;
    private final OtpService emailService;
    private final PasswordEncoder passwordEncoder;

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 15;

    /**
     * Generate và gửi OTP qua email
     */
    @Transactional
    public void sendPasswordResetOtp(String email) {
        // Kiểm tra email có tồn tại không
        List<Account> accounts = accountService.findByEmail(email);
        if (accounts.isEmpty()) {
            throw new RuntimeException("Email not found");
        }

        // Xóa các OTP cũ của email này
        tokenRepository.deleteByEmail(email);

        // Generate OTP
        String otp = generateOtp();

        // Lưu OTP vào database
        PasswordResetToken token = new PasswordResetToken();
        token.setEmail(email);
        token.setOtp(otp);
        token.setExpiryTime(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        token.setUsed(false);
        tokenRepository.save(token);

        // Gửi email
        emailService.sendOtpEmail(email, otp);
    }

    /**
     * Verify OTP
     */
    public boolean verifyOtp(String email, String otp) {
        return tokenRepository.findByEmailAndOtpAndUsedFalseAndExpiryTimeAfter(
                email,
                otp,
                LocalDateTime.now()
        ).isPresent();
    }

    /**
     * Reset password với OTP
     */
    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        // Tìm token
        PasswordResetToken token = tokenRepository
                .findByEmailAndOtpAndUsedFalseAndExpiryTimeAfter(email, otp, LocalDateTime.now())
                .orElseThrow(() -> new RuntimeException("Invalid or expired OTP"));

        // Tìm account
        List<Account> accounts = accountService.findByEmail(email);
        if (accounts.isEmpty()) {
            throw new RuntimeException("Account not found");
        }

        Account account = accounts.get(0);

        // Cập nhật password
        account.setPassword(passwordEncoder.encode(newPassword));
        accountService.save(account);

        // Đánh dấu token đã dùng
        token.setUsed(true);
        tokenRepository.save(token);
    }

    /**
     * Generate random OTP
     */
    private String generateOtp() {
        Random random = new Random();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }

    /**
     * Cleanup expired tokens (có thể chạy scheduled)
     */
    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteByExpiryTimeBefore(LocalDateTime.now());
    }
}