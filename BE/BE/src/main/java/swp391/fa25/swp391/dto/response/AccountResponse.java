package swp391.fa25.swp391.dto;

import lombok.Data;

@Data
public class AccountResponse {
    private String username;
    private String fullName;
    private String email;
    private String role;
}
