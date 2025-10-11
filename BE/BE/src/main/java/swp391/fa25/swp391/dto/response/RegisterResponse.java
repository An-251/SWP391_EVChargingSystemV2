package swp391.fa25.swp391.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RegisterResponse {
    private String message;
    private Integer id;
    private String username;
    private String email;
    private String role;
    private String token;
}