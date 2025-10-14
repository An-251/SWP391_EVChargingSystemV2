package swp391.fa25.swp391.dto.response;

import lombok.Data;

import java.time.Instant;

@Data
public class AccountResponse {
    private Integer id;
    private String username;
    private String fullName;
    private String email;
    private String role;
}
