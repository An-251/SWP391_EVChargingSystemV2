package swp391.fa25.swp391.dto.request;

import lombok.Data;

import java.time.Instant;

@Data
public class IncidentReportFilter {
    private String reportType;
    private String status;
    private String severity;
    private Integer pointId;
    private Integer stationId; // Giữ nguyên trường này
    private Instant startDate;
    private Instant endDate;
}