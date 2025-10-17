package swp391.fa25.swp391.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {
    private Integer employeeId;
    private Integer accountId;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String position;
    private String status;
}