package swp391.fa25.swp391.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateChargingRequestRequest {
    
    @NotNull(message = "Enterprise ID is required")
    private Integer enterpriseId;
    
    @NotNull(message = "Employee ID is required")
    private Integer employeeId;
    
    @NotNull(message = "Vehicle ID is required")
    private Integer vehicleId;
    
    @NotNull(message = "Charging point ID is required")
    private Integer chargingPointId;
    
    @NotNull(message = "Station ID is required")
    private Integer stationId;
    
    private LocalDateTime expectedArrivalTime;
    
    private Integer estimatedDuration; // minutes
    
    private String notes;
}
