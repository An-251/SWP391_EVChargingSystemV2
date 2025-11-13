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

    private Integer id;
    private Long reservationId; // Keep for backward compatibility

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startTime;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endTime;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    // Charging Point Info
    private Integer chargingPointId;
    private String chargingPointName;
    private String connectorType;
    
    // Station Info
    private Integer stationId;
    private String stationName;
    
    // Facility Info (for Employee monitoring)
    private Integer facilityId;
    private String facilityName;
    
    // Driver Info
    private Integer driverId;
    private String driverName;
    
    // Vehicle Info
    private Long vehicleId;
    private String vehicleLicensePlate;
    
    // Charger Info
    private Integer chargerId;

    // Status
    private String status; // PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
}