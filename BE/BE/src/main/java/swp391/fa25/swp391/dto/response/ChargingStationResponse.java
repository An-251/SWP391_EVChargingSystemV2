// Giả định: swp391.fa25.swp391.dto.response.ChargingStationResponse.java
package swp391.fa25.swp391.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChargingStationResponse {
    private Integer id;
    private String stationName;
    private Double latitude;
    private Double longitude;
    private String status;
    private Integer facilityId; // Trả về ID thay vì Entity
    private List<ChargingPointResponse> chargingPoints; // Nếu muốn hiển thị danh sách các Point
}