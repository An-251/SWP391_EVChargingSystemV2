package swp391.fa25.swp391.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponse {
    private Integer id;
    private String username;
    private String fullName;
    private String email;
    private String role;
    private String phone;
    private LocalDate dob;
    private String gender;
    private String status;
    private Double balance;
}
