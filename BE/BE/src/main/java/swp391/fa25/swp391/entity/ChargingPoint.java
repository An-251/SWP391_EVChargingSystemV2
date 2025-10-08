package swp391.fa25.swp391.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "CHARGING_POINT")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChargingPoint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "POINT_ID")
    private Integer id;

    @Nationalized
    @Column(name = "POINT_NAME", length = 100)
    private String pointName;

    @Nationalized
    @Column(name = "CONNECTOR_TYPE", length = 50)
    private String connectorType;

    @Column(name = "MAX_POWER", precision = 10, scale = 2)
    private BigDecimal maxPower;

    @Nationalized
    @Column(name = "STATUS", length = 50)
    private String status;

    @Column(name = "PRICE_PER_KWH", precision = 18, scale = 2)
    private BigDecimal pricePerKwh;

    @ManyToOne
    @JoinColumn(name = "STATION_ID")
    private ChargingStation station;

    @OneToMany(mappedBy = "chargingPoint")
    private List<ChargingSession> chargingSessions = new ArrayList<>() ;
}