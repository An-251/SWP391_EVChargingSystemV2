package swp391.fa25.swp391.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RejectChargingRequestRequest {
    
    @NotNull(message = "Station employee ID is required")
    private Integer stationEmployeeId;
    
    @NotBlank(message = "Reject reason is required")
    private String rejectReason;
}
