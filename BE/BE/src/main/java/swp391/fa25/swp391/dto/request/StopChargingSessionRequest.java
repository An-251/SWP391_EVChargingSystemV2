package swp391.fa25.swp391.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request để dừng phiên sạc
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StopChargingSessionRequest {

    @NotNull(message = "End percentage is required")
    @Min(value = 0, message = "End percentage must be between 0 and 100")
    @Max(value = 100, message = "End percentage must be between 0 and 100")
    private Integer endPercentage;
}