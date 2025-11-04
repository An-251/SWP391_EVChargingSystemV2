
package swp391.fa25.swp391.entity;

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

    @ManyToOne
    @JoinColumn(name = "INVOICE_ID")
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ENT_INVOICE_ID")
    private EnterpriseInvoice enterpriseInvoice; // Liên kết tới Hóa đơn Doanh nghiệp

}