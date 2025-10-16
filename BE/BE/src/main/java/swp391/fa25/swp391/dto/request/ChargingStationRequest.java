package swp391.fa25.swp391.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChargingStationRequest {

    @NotBlank(message = "Station name is required")
    @Size(max = 100, message = "Station name cannot exceed 100 characters")
    private String stationName;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    // Status có thể là NOT_NULL hoặc BLANK, tùy theo quy tắc kinh doanh
    @NotBlank(message = "Status is required")
    @Size(max = 50, message = "Status cannot exceed 50 characters")
    private String status;

    @NotNull(message = "Facility ID is required")
    private Integer facilityId; // Chỉ nhận ID của Facility
}