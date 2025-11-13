package swp391.fa25.swp391.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "RESERVATION")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "start_time")
    private LocalDateTime startTime;
    
    @Column(name = "end_time")
    private LocalDateTime endTime;
    
    private String status;
    
    @ManyToOne
    @JoinColumn(name = "driver_id")
    @JsonIgnoreProperties({"vehicles", "planRegistrations", "account"})
    private Driver driver;
    
    @ManyToOne
    @JoinColumn(name = "charging_point_id")
    private ChargingPoint chargingPoint;
    
    // ⭐ NEW: Thêm quan hệ với Charger (specific charger được đặt)
    @ManyToOne
    @JoinColumn(name = "charger_id")
    private Charger charger;
    
    // ⭐ Thêm quan hệ với Vehicle
    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;
}
