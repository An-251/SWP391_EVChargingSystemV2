package swp391.fa25.swp391.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChargerRequest {

    @NotBlank(message = "Charger code is required")
    @Size(max = 50, message = "Charger code cannot exceed 50 characters")
    private String chargerCode;

    @NotNull(message = "Max power is required")
    @PositiveOrZero(message = "Max power must be non-negative")
    private BigDecimal maxPower;

    @NotBlank(message = "Connector type is required")
    @Size(max = 50, message = "Connector type cannot exceed 50 characters")
    private String connectorType;

    @NotBlank(message = "Status is required")
    @Size(max = 50, message = "Status cannot exceed 50 characters")
    private String status;

    @NotNull(message = "Charging Point ID is required")
    private Integer chargingPointId; // ID của ChargingPoint mà charger thuộc về
}
