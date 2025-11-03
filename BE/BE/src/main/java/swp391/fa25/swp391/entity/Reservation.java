package swp391.fa25.swp391.entity;

import jakarta.persistence.*;
import lombok.*;
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

    // Thời gian bắt đầu đặt
    private LocalDateTime startTime;

    // Thời gian kết thúc đặt
    private LocalDateTime endTime;

    // Trạng thái (ví dụ: ACTIVE, CANCELLED, COMPLETED)
    private String status;

    // Liên kết đến Driver
    @ManyToOne
    @JoinColumn(name = "driver_id")
    private Driver driver;

    // Liên kết đến ChargingPoint
    @ManyToOne
    @JoinColumn(name = "charging_point_id")
    private ChargingPoint chargingPoint;
}
