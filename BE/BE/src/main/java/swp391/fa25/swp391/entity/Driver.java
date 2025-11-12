package swp391.fa25.swp391.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "DRIVER")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Driver {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DRIVER_ID", nullable = false)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "ACCOUNT_ID")
    @JsonIgnoreProperties({"driver", "admin", "employee", "staffAccount"})
    private Account account;

    @Nationalized
    @Column(name = "ID_NUMBER", length = 50)
    private String idNumber;

    @OneToMany(mappedBy = "driver")
    @JsonIgnoreProperties({"driver"})
    private List<Vehicle> vehicles = new ArrayList<>();

    @OneToMany(mappedBy = "driver")
    @JsonIgnoreProperties({"driver"})
    private List<PlanRegistration> planRegistrations = new ArrayList<>();
}
