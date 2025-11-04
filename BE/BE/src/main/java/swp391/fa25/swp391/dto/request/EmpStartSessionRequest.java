package swp391.fa25.swp391.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO Request cho StationEmployee bắt đầu một phiên sạc cho xe Enterprise
 */
@Data
public class EmpStartSessionRequest {

    @NotNull(message = "Vehicle ID is required")
    private Integer vehicleId; // ID của xe doanh nghiệp

    @NotNull(message = "Charging Point ID is required")
    private Integer chargingPointId; // ID của điểm sạc

    @NotNull(message = "Start percentage is required")
    private Integer startPercentage;
}
