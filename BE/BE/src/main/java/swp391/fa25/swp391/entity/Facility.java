
package swp391.fa25.swp391.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "FACILITY")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Facility {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "FACILITY_ID")
    private Integer id;

    @Nationalized
    @Column(name = "NAME")
    private String name;

    @Nationalized
    @Column(name = "CITY", length = 100)
    private String city;

    @Nationalized
    @Column(name = "DISTRICT", length = 100)
    private String district;

    @Nationalized
    @Column(name = "WARD", length = 100)
    private String ward;

    @Nationalized
    @Column(name = "STREET_ADDRESS")
    private String streetAddress;

    @Nationalized
    @Column(name = "STATUS", length = 50)
    private String status;

    @Column(name = "IS_DELETED")
    private Boolean isDeleted = false;

    @Column(name = "DELETED_AT")
    private java.time.Instant deletedAt;

    @Nationalized
    @Column(name = "DELETED_BY", length = 255)
    private String deletedBy;

    @ManyToOne
    @JoinColumn(name = "ADMIN_ID")
    @JsonIgnoreProperties({"facilities", "account"})
    private Admin admin;

    @OneToMany(mappedBy = "facility")
    @JsonIgnoreProperties({"facility"})
    private List<ChargingStation> chargingStations = new ArrayList<>();

    @Transient
    public String getFullAddress() {
        return (streetAddress != null ? streetAddress : "")
                + (ward != null ? ", " + ward : "")
                + (district != null ? ", " + district : "")
                + (city != null ? ", " + city : "");
    }
}