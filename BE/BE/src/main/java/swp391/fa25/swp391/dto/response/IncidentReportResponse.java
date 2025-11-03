package swp391.fa25.swp391.dto.response;

import lombok.Data;

import java.time.Instant;

@Data
public class IncidentReportResponse {
    private Integer id;
    private Instant reportDate;
    private String description;
    private String severity;
    private String status;
    private String reportType; // USER_REPORTED, SYSTEM_DETECTED

    // Thông tin charging point
    private Integer pointId;
    private String pointName;
    private String stationName;

    // Thông tin reporter (nếu có)
    private Integer reporterUserId;
    private String reporterName;
    private String reporterEmail;

    // Thông tin handler (nếu có)
    private Integer handlerEmployeeId;
    private String handlerEmployeeName;

    private Instant resolvedDate;
    private String resolutionNotes;
}
