package swp391.fa25.swp391.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for reservation
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationResponse {

    private Long reservationId;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startTime;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endTime;

    private String chargingPointName;

    private String connectorType;

    private String stationName;

    private String status; // ACTIVE, COMPLETED, CANCELLED

    private Long vehicleId; // Vehicle ID for this reservation
    
    private Integer chargingPointId; // Charging point ID
    
    private Integer stationId; // Station ID
}