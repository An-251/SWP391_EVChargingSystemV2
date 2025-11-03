package swp391.fa25.swp391.dto.request;

import lombok.Data;

@Data
public class HandleReportRequest {
    private Integer reportId;
    private Integer employeeId;
    private String status; // PENDING, IN_PROGRESS, RESOLVED, CLOSED
    private String resolutionNotes;
}