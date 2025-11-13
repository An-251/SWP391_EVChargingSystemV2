package swp391.fa25.swp391.dto.request;

import lombok.Data;

@Data
public class SystemReportRequest {
    private Integer pointId;
    private String description;
    private String severity;
    private String systemSource;
}
