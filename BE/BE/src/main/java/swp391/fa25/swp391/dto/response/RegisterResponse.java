package swp391.fa25.swp391.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterResponse {
    private String message;
    private Integer accountId;
    private String username;
    private String email;
    private String role;
    private String token;

    // Role-specific IDs (chỉ có giá trị tương ứng với role)
    private Integer driverId;      // Cho Driver
    private Integer adminId;       // Cho Admin
    private Integer employeeId;    // Cho StationEmployee
    private Integer enterpriseId;  // Cho EnterpriseManager
}