
package swp391.fa25.swp391.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "CHARGING_SESSION")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChargingSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SESSION_ID")
    private Integer id;

    @Column(name = "START_TIME")
    private LocalDateTime startTime;

    @Column(name = "END_TIME")
    private LocalDateTime endTime;

    @Column(name = "OVERUSEDTIME", precision = 10, scale = 2)
    private BigDecimal overusedTime;

    @Column(name = "KWH_USED", precision = 18, scale = 2)
    private BigDecimal kwhUsed;

    @Column(name = "COST", precision = 18, scale = 2)
    private BigDecimal cost;

    @Nationalized
    @Column(name = "STATUS", length = 50)
    private String status;

    @Column(name = "START_PERCENTAGE")
    private Integer startPercentage;

    @Column(name = "END_PERCENTAGE")
    private Integer endPercentage;

    @ManyToOne
    @JoinColumn(name = "DRIVER_ID")
    private Driver driver;

    @ManyToOne
    @JoinColumn(name = "VEHICLE_ID")
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "POINT_ID")
    private ChargingPoint chargingPoint;

}