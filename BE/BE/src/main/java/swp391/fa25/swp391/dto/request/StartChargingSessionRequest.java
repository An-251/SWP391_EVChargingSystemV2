package swp391.fa25.swp391.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request để bắt đầu phiên sạc
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartChargingSessionRequest {

    @NotNull(message = "Driver ID is required")
    private Integer driverId;

    @NotNull(message = "Charging point ID is required")
    private Integer chargingPointId;

    @NotNull(message = "Vehicle ID is required")
    private Integer vehicleId;

    @NotNull(message = "Start percentage is required")
    @Min(value = 0, message = "Start percentage must be between 0 and 100")
    @Max(value = 100, message = "Start percentage must be between 0 and 100")
    private Integer startPercentage;
}