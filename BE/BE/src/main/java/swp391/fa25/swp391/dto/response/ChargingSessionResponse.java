package swp391.fa25.swp391.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
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

    private String vehicleModel;
    private String licensePlate;

    // Charger info
    private Integer chargerId;
    private String chargerCode;
    private String connectorType;
    
    // Charging point info (parent of charger)
    private Integer chargingPointId;
    private String chargingPointName;
    
    // Station info
    private Integer stationId;
    private String stationName;
    private String stationAddress;
    
    // Facility info
    private Integer facilityId;
    private String facilityName;

    // Session timing
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long durationMinutes; // Thời gian sạc (phút)
    private BigDecimal overusedTime; // Thời gian vượt quá khi đầy pin

    // Charging data
    private Integer startPercentage;
    private Integer endPercentage;
    private Integer chargedPercentage;
    private BigDecimal kwhUsed; // Điện năng tiêu thụ (kWh)
    private BigDecimal pricePerKwh; // ⭐ ADD: Giá điện từ charging point (VND/kWh)
    
    // Cost breakdown
    private BigDecimal startFee; // Phí khởi động phiên sạc (VND)
    private BigDecimal energyCostBeforeDiscount; // ⭐ ADD: Chi phí điện năng trước giảm giá (VND)
    private BigDecimal energyCostAfterDiscount; // ⭐ ADD: Chi phí điện năng sau giảm giá (VND)
    private BigDecimal overusePenalty; // ⭐ ADD: Phí phạt khi sạc quá thời gian (VND)
    private BigDecimal cost; // Tổng chi phí (VND)
    
    // Subscription info
    private String subscriptionPlanName; // ⭐ ADD: Tên gói subscription (VD: "Basic Plan")
    private BigDecimal discountRate; // ⭐ ADD: % giảm giá (VD: 25 = 25%)

    //Reservation
    private Long reservationId;
    private String chargingType;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime reservationStartTime;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime reservationEndTime;
    private String status; // ACTIVE, COMPLETED, CANCELLED
}