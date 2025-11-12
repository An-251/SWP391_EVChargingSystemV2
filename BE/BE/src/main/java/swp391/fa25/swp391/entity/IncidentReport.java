package swp391.fa25.swp391.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.Nationalized;

import java.time.Instant;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "INCIDENT_REPORT")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "REPORT_ID", nullable = false)
    private Integer id;

    @Column(name = "REPORT_DATE", nullable = false)
    private Instant reportDate;

    @Nationalized
    @Column(name = "TITLE", length = 255)
    private String title;

    @Nationalized
    @Column(name = "DESCRIPTION", nullable = false, length = 1000)
    private String description;

    @Nationalized
    @Column(name = "SEVERITY", length = 50)
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    @Nationalized
    @Column(name = "STATUS", length = 50)
    private String status; // PENDING, IN_PROGRESS, RESOLVED, CLOSED, REJECTED

    // Thêm trường để phân biệt loại báo cáo: "USER_REPORTED", "SYSTEM_DETECTED", "EMPLOYEE_REPORTED"
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

    @Nationalized
    @Column(name = "REPORTER_PHONE", length = 20)
    private String reporterPhone;

    // Assignment to Admin
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ASSIGNED_TO_ADMIN_ID")
    @JsonIgnore
    private Account assignedToAdmin;

    // Location information - Keep these for response
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "POINT_ID", nullable = false)
    @JsonIgnoreProperties({"station", "chargers", "chargingSessions", "incidentReports", "hibernateLazyInitializer", "handler"})
    private ChargingPoint point;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "STATION_ID")
    @JsonIgnoreProperties({"facility", "chargingPoints", "stationEmployees", "incidentReports", "hibernateLazyInitializer", "handler"})
    private ChargingStation station;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "CHARGER_ID")
    @JsonIgnoreProperties({"chargingPoint", "chargingSessions", "incidentReports", "hibernateLazyInitializer", "handler"})
    private Charger charger;

    // Related session (if applicable)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SESSION_ID")
    @JsonIgnore
    private ChargingSession relatedSession;

    // Employee handling (for employee-reported incidents)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "HANDLER_EMPLOYEE_ID")
    @JsonIgnore
    private StationEmployee employee;

    // Resolution
    @Column(name = "RESOLVED_DATE")
    private Instant resolvedDate;

    @Nationalized
    @Column(name = "RESOLUTION_NOTES", length = 1000)
    private String resolutionNotes;

    // Attachments (file URLs)
    @Nationalized
    @Column(name = "ATTACHMENTS", columnDefinition = "nvarchar(max)")
    private String attachments; // JSON array

    // Metadata
    @Builder.Default
    @Column(name = "IS_DELETED")
    private Boolean isDeleted = false;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (reportDate == null) {
            reportDate = Instant.now();
        }
        if (status == null) {
            status = "PENDING";
        }
        if (severity == null) {
            severity = "MEDIUM";
        }
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}