package swp391.fa25.swp391.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateEnterpriseVehicleRequest {
    
    @NotNull(message = "Enterprise ID is required")
    private Integer enterpriseId;
    
    @NotBlank(message = "License plate is required")
    private String licensePlate;
    
    @NotBlank(message = "Vehicle name is required")
    private String vehicleName;
    
    private String brand;
    
    private String model;
    
    private Integer year;
    
    private String color;
    
    private BigDecimal batteryCapacity;
    
    private String connectorType;
    
    private BigDecimal maxChargingPower;
    
    private Integer assignedEmployeeId;
}
