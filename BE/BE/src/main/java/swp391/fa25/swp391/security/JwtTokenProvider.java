package swp391.fa25.swp391.security;

import io.jsonwebtoken.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import swp391.fa25.swp391.entity.Account;

import java.util.Date;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final JwtConfig jwtConfig;
    //Lấy secret key để xác minh chữ ký

    public String generateToken(Account account) {
        //Lấy thời gian hiện tại
        Date now = new Date();
        //Tính thời gian hết hạn
        long expirationTimeMs = jwtConfig.getExpirationMs();
        Date expiryDate = new Date(now.getTime() + expirationTimeMs);
        //Lấy thông tin cần đưa vào token
        String subject = account.getUsername();
        String secretKey = jwtConfig.getSecret();
        JwtBuilder builder = Jwts.builder()
                .setSubject(subject)       // Set chủ thể (username)
                .setIssuedAt(now)          // Ngày phát hành
                .setExpiration(expiryDate) // Ngày hết hạn
                .signWith(SignatureAlgorithm.HS512, secretKey); // Ký token bằng thuật toán HS512
        String token = builder.compact();
        return token;
    }

    public String getUsernameFromToken(String token) {
        String secretKey = jwtConfig.getSecret();
        Claims claims = Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        String secretKey = jwtConfig.getSecret();
        try {
            Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token);
            return true;
        } catch (SignatureException ex) {
            // Incorrect JWT signature
            return false;
        } catch (MalformedJwtException ex) {
            // Invalid format JWT token
            return false;
        } catch (ExpiredJwtException ex) {
            // Expired JWT token
            return false;
        } catch (UnsupportedJwtException ex) {
            // Unsupported JWT token
            return false;
        } catch (IllegalArgumentException ex) {
            // JWT claims string is empty
            return false;
        }
    }
}