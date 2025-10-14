package swp391.fa25.swp391.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChargingSessionResponse {

    private Integer sessionId;

    // Driver info
    private Integer driverId;
    private String driverName;

    // Vehicle info
    private Integer vehicleId;
    private String vehicleName;
    private String licensePlate;

    // Charging point info
    private Integer chargingPointId;
    private String chargingPointName;
    private String stationName;
    private String connectorType;

    // Session timing
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long durationMinutes; // Thời gian sạc (phút)
    private BigDecimal overusedTime; // Thời gian vượt quá khi đầy pin

    // Charging data
    private Integer startPercentage;
    private Integer endPercentage;
    private BigDecimal kwhUsed; // Điện năng tiêu thụ (kWh)
    private BigDecimal cost; // Tổng chi phí (VND)

    private String status; // ACTIVE, COMPLETED, CANCELLED
}