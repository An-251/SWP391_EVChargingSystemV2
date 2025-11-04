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
@Table(name = "VEHICLE")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "VEHICLE_ID")
    private Integer id;

    @Nationalized
    @Column(name = "LICENSE_PLATE", length = 20)
    private String licensePlate;

    @Nationalized
    @Column(name = "BRAND", length = 100)
    private String brand;

    @Nationalized
    @Column(name = "MODEL", length = 100)
    private String model;

    @Nationalized
    @Column(name = "CHARGING_PORT", length = 100)
    private String chargingPort;

    @Column(name = "BATTERY_CAPACITY", precision = 10, scale = 2)
    private BigDecimal batteryCapacity;

    @ManyToOne
    @JoinColumn(name = "DRIVER_ID", nullable = true) // <-- THÊM nullable = true
    private Driver driver;

    @OneToMany(mappedBy = "vehicle")
    private List<ChargingSession> chargingSessions = new ArrayList<>();
    @ManyToOne
    @JoinColumn(name = "enterprise_id")
    private Enterprise enterprise;
}