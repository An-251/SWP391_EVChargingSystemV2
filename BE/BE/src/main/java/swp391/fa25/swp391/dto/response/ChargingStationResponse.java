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
    private FacilityInfo facility; // Add facility info for frontend
    private List<ChargingPointResponse> chargingPoints; // Nếu muốn hiển thị danh sách các Point

    // Nested class for Facility info (avoid circular reference)
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FacilityInfo {
        private Integer id;
        private String name;
        private String streetAddress;
        private String ward;
        private String district;
        private String city;
        private String address; // For backward compatibility
    }
}