package swp391.fa25.swp391.dto.request;

import lombok.Data;

@Data
public class EmployeeCreateReportRequest {
    private Integer pointId;
    private Integer chargerId; // ⭐ NEW: ID của charger nếu báo cáo sự cố charger
    private String reportTarget; // ⭐ NEW: "CHARGING_POINT" hoặc "CHARGER"
    private String description;
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    // Thông tin user báo cáo (employee ghi lại)
    private Integer reporterUserId;
    private String reporterName;
    private String reporterEmail;
    private String reporterPhone; // Có thể thêm nếu cần

    // Thông tin employee ghi nhận
    private Integer employeeId;
    private String employeeNotes; // Ghi chú của employee khi tiếp nhận
}