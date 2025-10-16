package swp391.fa25.swp391.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {
    private Integer id;
    private String licensePlate;
    private String brand;
    private String model;
    private String chargingPort;
    private BigDecimal batteryCapacity;
    private Integer driverId;
    private String driverName;
}