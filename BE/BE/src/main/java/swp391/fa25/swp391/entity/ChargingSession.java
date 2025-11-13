
package swp391.fa25.swp391.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "charging_session")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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

    @Column(name = "START_FEE", precision = 18, scale = 2)
    private BigDecimal startFee;

    @Column(name = "OVERUSE_PENALTY", precision = 18, scale = 2)
    private BigDecimal overusePenalty; // ⭐ ADD: Phí phạt khi sạc quá thời gian

    @Nationalized
    @Column(name = "STATUS", length = 50)
    private String status;

    @Column(name = "START_PERCENTAGE")
    private Integer startPercentage;

    @Column(name = "END_PERCENTAGE")
    private Integer endPercentage;

    @ManyToOne
    @JoinColumn(name = "DRIVER_ID")
    @JsonIgnoreProperties({"vehicles", "account", "chargingSessions", "invoices", "planRegistrations"})
    private Driver driver;

    @ManyToOne
    @JoinColumn(name = "VEHICLE_ID")
    @JsonIgnoreProperties({"driver", "chargingSessions"})
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "CHARGER_ID")
    @JsonIgnoreProperties({"chargingSessions", "chargingPoint"})
    private Charger charger;

    @ManyToOne
    @JoinColumn(name = "INVOICE_ID")
    @JsonIgnoreProperties({"driver", "sessions", "planAtBilling"})
    private Invoice invoice;
    @OneToOne(optional = true)
    @JoinColumn(name = "RESERVATION_ID", referencedColumnName = "id")
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STARTED_BY_EMPLOYEE_ID")
    private StationEmployee startedByEmployee; // Nhân viên trạm đã BẮT ĐẦU

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ENDED_BY_EMPLOYEE_ID")
    private StationEmployee endedByEmployee; // Nhân viên trạm đã KẾT THÚC

}
