package swp391.fa25.swp391.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "ACCOUNT")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ACCOUNT_ID")
    private Integer id;

    @Column(name = "USERNAME", unique = true)
    private String username;


    @Column(name = "PASSWORD")
    private String password;

    @Nationalized
    @Column(name = "FULL_NAME")
    private String fullName;


    @Nationalized
    @Column(name = "GENDER", length = 10)
    private String gender;


    @Column(name = "DOB")
    private LocalDate dob;


    @Nationalized
    @Column(name = "PHONE", length = 20)
    private String phone;

    @Nationalized
    @Column(name = "EMAIL")
    private String email;


    @Column(name = "CREATED_DATE")
    @ColumnDefault("getdate()")
    private Instant createdDate;

    @Nationalized
    @Column(name = "STATUS", length = 50)
    private String status;

    @Nationalized
    @Column(name = "ACCOUNT_ROLE", length = 50)
    private String accountRole;


    @Nationalized
    @Column(name = "BALANCE")
    private Double balance;


    @OneToOne(mappedBy = "account", fetch = FetchType.LAZY)
    private Driver driver;

    @OneToOne(mappedBy = "account", fetch = FetchType.LAZY)
    private Admin admin;

    @OneToOne(mappedBy = "account", fetch = FetchType.LAZY)
    private StationEmployee stationEmployee;

    @OneToOne(mappedBy = "managerAccount", fetch = FetchType.LAZY)
    private Enterprise enterprise;

}
