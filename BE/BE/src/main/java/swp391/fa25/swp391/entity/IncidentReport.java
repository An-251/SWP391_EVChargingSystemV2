package swp391.fa25.swp391.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "INCIDENT_REPORT")
public class IncidentReport {
    @Id
    @Column(name = "REPORT_ID", nullable = false)
    private Integer id;

    @Column(name = "REPORT_DATE", nullable = false)
    private Instant reportDate;

    @Nationalized
    @Column(name = "DESCRIPTION", nullable = false, length = 1000)
    private String description;

    @Nationalized
    @Column(name = "SEVERITY", length = 50)
    private String severity;

    @Nationalized
    @Column(name = "STATUS", length = 50)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "POINT_ID", nullable = false)
    private ChargingPoint point;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "HANDLER_EMPLOYEE_ID", nullable = false)
    private StationEmployee employee;

}