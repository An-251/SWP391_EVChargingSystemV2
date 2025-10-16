// Giả định: swp391.fa25.swp391.dto.response.ChargingPointResponse.java
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
public class ChargingPointResponse {
    private Integer id;
    private String pointName;
    private String connectorType;
    private BigDecimal maxPower;
    private String status;
    private BigDecimal pricePerKwh;
    private Integer stationId; // Trả về ID thay vì Entity
    private String stationName; // Thêm tên trạm sạc cho tiện
}