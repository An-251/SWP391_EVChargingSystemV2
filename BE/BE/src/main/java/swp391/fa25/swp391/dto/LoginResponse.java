package swp391.fa25.swp391.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import swp391.fa25.swp391.entity.Account;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private AccountResponse account;
}