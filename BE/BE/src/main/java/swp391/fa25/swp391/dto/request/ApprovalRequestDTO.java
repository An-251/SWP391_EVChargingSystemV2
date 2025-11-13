package swp391.fa25.swp391.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalRequestDTO {
    private Integer employeeId;
    private String notes;
}
