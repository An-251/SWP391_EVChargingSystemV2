package swp391.fa25.swp391.security;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "jwt")
@Data
public class JwtConfig {
    private String secret = "swp391_swp391_swp391_swp391_swp391_swp391_swp391_swp391_swp391_1234567890";
    private long expirationMs = 86400000; // 1 day
}