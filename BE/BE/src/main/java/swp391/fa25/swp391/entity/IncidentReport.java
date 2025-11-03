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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    // Thêm trường để phân biệt loại báo cáo: "USER_REPORTED" hoặc "SYSTEM_DETECTED"
    @Nationalized
    @Column(name = "REPORT_TYPE", length = 50)
    private String reportType;

    // Thông tin user báo cáo (nếu là USER_REPORTED)
    @Column(name = "REPORTER_USER_ID")
    private Integer reporterUserId;

    @Nationalized
    @Column(name = "REPORTER_NAME", length = 255)
    private String reporterName;

    @Nationalized
    @Column(name = "REPORTER_EMAIL", length = 255)
    private String reporterEmail;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "POINT_ID", nullable = false)
    private ChargingPoint point;

    // Trong Entity IncidentReport mới:
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "HANDLER_EMPLOYEE_ID")
    private StationEmployee employee;

    @Column(name = "RESOLVED_DATE")
    private Instant resolvedDate;

    @Nationalized
    @Column(name = "RESOLUTION_NOTES", length = 1000)
    private String resolutionNotes;
}