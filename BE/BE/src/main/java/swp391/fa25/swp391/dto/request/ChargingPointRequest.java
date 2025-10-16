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
public class ChargingPointRequest {

    @NotBlank(message = "Point name is required")
    @Size(max = 100, message = "Point name cannot exceed 100 characters")
    private String pointName;

    @NotBlank(message = "Connector type is required")
    @Size(max = 50, message = "Connector type cannot exceed 50 characters")
    private String connectorType;

    @NotNull(message = "Max power is required")
    @PositiveOrZero(message = "Max power must be non-negative")
    private BigDecimal maxPower;

    @NotBlank(message = "Status is required")
    @Size(max = 50, message = "Status cannot exceed 50 characters")
    private String status;

    @NotNull(message = "Price per Kwh is required")
    @PositiveOrZero(message = "Price per Kwh must be non-negative")
    private BigDecimal pricePerKwh;

    @NotNull(message = "Station ID is required")
    private Integer stationId; // Chỉ nhận ID của ChargingStation
}