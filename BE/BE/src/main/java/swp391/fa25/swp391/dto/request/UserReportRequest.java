package swp391.fa25.swp391.dto.request;

import lombok.Data;

// DTO cho user báo lỗi (Hướng 1)
@Data
public class UserReportRequest {
    private Integer pointId;
    private String description;
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL
    private Integer reporterUserId;
    private String reporterName;
    private String reporterEmail;
}