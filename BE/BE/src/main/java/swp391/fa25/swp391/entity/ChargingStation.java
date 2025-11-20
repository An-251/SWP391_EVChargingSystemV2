package swp391.fa25.swp391.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "CHARGING_STATION")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChargingStation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "STATION_ID")
    private Integer id;

    @Nationalized
    @Column(name = "NAME", length = 100)
    private String stationName;


    @Column(name = "LATITUDE")
    private Double latitude;

    @Column(name = "LONGITUDE")
    private Double longitude;

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
    @JoinColumn(name = "FACILITY_ID")
    private Facility facility;

    @OneToMany(mappedBy = "station")
    private List<ChargingPoint> chargingPoints= new ArrayList<>();


}