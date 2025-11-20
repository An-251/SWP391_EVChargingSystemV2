package swp391.fa25.swp391.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "STATION_EMPLOYEE")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StationEmployee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "EMPLOYEE_ID")
    private Integer id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ACCOUNT_ID")
    private Account account;

    @Nationalized
    @Column(name = "POSITION", length = 100)
    private String position;

    @Column(name = "IS_DELETED")
    private Boolean isDeleted = false;

    @Column(name = "DELETED_AT")
    private java.time.Instant deletedAt;

    @Nationalized
    @Column(name = "DELETED_BY", length = 255)
    private String deletedBy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "FACILITY_ID")
    private Facility facility;
}