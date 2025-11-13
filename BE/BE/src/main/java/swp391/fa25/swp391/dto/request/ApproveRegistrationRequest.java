package swp391.fa25.swp391.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApproveRegistrationRequest {
    
    @NotNull(message = "Admin ID is required")
    private Integer adminId;
    
    @NotNull(message = "Plan ID is required for approved enterprise")
    private Integer subscriptionPlanId;
}
