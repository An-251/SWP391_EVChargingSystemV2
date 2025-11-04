// repository/PasswordResetTokenRepository.java
package swp391.fa25.swp391.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.PasswordResetToken;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Integer> {

    Optional<PasswordResetToken> findByEmailAndOtpAndUsedFalseAndExpiryTimeAfter(
            String email,
            String otp,
            LocalDateTime currentTime
    );

    void deleteByExpiryTimeBefore(LocalDateTime currentTime);

    void deleteByEmail(String email);
}