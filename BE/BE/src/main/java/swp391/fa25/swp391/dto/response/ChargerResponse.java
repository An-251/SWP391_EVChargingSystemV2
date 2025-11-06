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
public class ChargerResponse {
    private Integer id;
    private String chargerCode;
    private String connectorType;
    private BigDecimal maxPower;
    private String status;
    private Integer chargingPointId; // ID của charging point
    private String chargingPointName; // Tên charging point cho tiện
}
