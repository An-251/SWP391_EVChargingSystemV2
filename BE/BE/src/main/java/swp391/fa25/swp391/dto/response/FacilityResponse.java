package swp391.fa25.swp391.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FacilityResponse {
    private Integer id;
    private String name;
    private String city;
    private String district;
    private String ward;
    private String streetAddress;
    private String fullAddress;
    private Integer adminId;
    private int stationCount;
    private String status;
}