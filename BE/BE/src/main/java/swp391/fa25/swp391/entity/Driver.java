package swp391.fa25.swp391.entity;

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
public class Driver {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DRIVER_ID", nullable = false)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "ACCOUNT_ID")
    private Account account;

    @Nationalized
    @Column(name = "ID_NUMBER", length = 50)
    private String idNumber;

    @OneToMany(mappedBy = "driver")
    private List<Vehicle> vehicles = new ArrayList<>();
}
