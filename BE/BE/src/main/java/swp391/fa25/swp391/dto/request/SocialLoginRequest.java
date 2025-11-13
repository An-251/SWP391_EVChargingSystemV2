package swp391.fa25.swp391.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SocialLoginRequest {
    
    @NotBlank(message = "Provider is required")
    private String provider; // "GOOGLE" or "FACEBOOK"
    
    @NotBlank(message = "ID token is required")
    private String idToken; // Firebase ID token
    
    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;
    
    private String fullName;
    
    private String photoURL;
}
