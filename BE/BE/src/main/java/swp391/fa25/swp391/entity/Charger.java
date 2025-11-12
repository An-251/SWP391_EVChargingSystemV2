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
@Table(name = "CHARGER")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Charger {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CHARGER_ID")
    private Integer id;

    @Nationalized
    @Column(name = "CHARGER_CODE", length = 50, unique = true)
    private String chargerCode;

    @Column(name = "MAX_POWER", precision = 10, scale = 2)
    private BigDecimal maxPower;

    @Nationalized
    @Column(name = "CONNECTOR_TYPE", length = 50)
    private String connectorType;

    @Nationalized
    @Column(name = "STATUS", length = 50)
    private String status;

    @ManyToOne
    @JoinColumn(name = "POINT_ID")
    private ChargingPoint chargingPoint;

    @OneToMany(mappedBy = "charger", cascade = CascadeType.ALL)
    private List<ChargingSession> chargingSessions = new ArrayList<>();
}
