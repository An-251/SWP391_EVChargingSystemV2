package swp391.fa25.swp391.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;
import java.time.LocalDate;

@Entity
@Table(name = "PLAN_REGISTRATION")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "REG_ID")
    private Integer id;

    @Column(name = "START_DATE")
    private LocalDate startDate;

    @Column(name = "END_DATE")
    private LocalDate endDate;

    @Nationalized
    @Column(name = "STATUS", length = 50)
    private String status;

    @ManyToOne
    @JoinColumn(name = "DRIVER_ID")
    @JsonIgnoreProperties({"vehicles", "planRegistrations", "account"})
    private Driver driver;

    @ManyToOne
    @JoinColumn(name = "PLAN_ID")
    private SubscriptionPlan plan;
}