package swp391.fa25.swp391.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.*;
import swp391.fa25.swp391.entity.IncidentReport;
import swp391.fa25.swp391.service.IService.IIncidentReportService;

import java.util.List;

@RestController
@RequestMapping("/api/incident-reports")
@RequiredArgsConstructor
@Tag(name = "Incident Report", description = "APIs cho quản lý báo cáo sự cố")
public class IncidentReportController {

    private final IIncidentReportService incidentReportService;

    // ==================== HƯỚNG 1: USER BÁO LỖI ====================

    @PostMapping("/user-report")
    @Operation(summary = "User báo cáo lỗi")
    public ResponseEntity<IncidentReport> createUserReport(
            @RequestBody UserReportRequest request) {
        IncidentReport savedReport = incidentReportService.createUserReport(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedReport);
    }

    // ==================== HƯỚG 2: SYSTEM TỰ ĐỘNG BÁO LỖI ====================

    @PostMapping("/system-report")
    @Operation(summary = "System tự động báo lỗi")
    public ResponseEntity<IncidentReport> createSystemReport(
            @RequestBody SystemReportRequest request) {
        IncidentReport savedReport = incidentReportService.createSystemReport(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedReport);
    }

    // ==================== ADMIN XỬ LÝ BÁO CÁO ====================

    @PutMapping("/{reportId}/status")
    @Operation(summary = "Cập nhật trạng thái")
    public ResponseEntity<IncidentReport> updateStatus(
            @PathVariable Integer reportId,
            @RequestParam String status) {
        IncidentReport updatedReport = incidentReportService.updateReportStatus(reportId, status);
        return ResponseEntity.ok(updatedReport);
    }

    @PutMapping("/{reportId}/close")
    @Operation(summary = "Đóng báo cáo")
    public ResponseEntity<IncidentReport> closeReport(
            @PathVariable Integer reportId,
            @RequestBody CloseReportRequest request) { // Dùng DTO để nhận JSON
        IncidentReport closedReport = incidentReportService.closeReport(reportId, request.getResolutionNotes());
        return ResponseEntity.ok(closedReport);
    }

    // ==================== ADMIN XEM BÁO CÁO ====================

    @GetMapping
    @Operation(summary = "Xem tất cả báo cáo")
    public ResponseEntity<List<IncidentReport>> getAllReports() {
        List<IncidentReport> reports = incidentReportService.getAllReports();
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/filter")
    @Operation(summary = "Lọc báo cáo")
    public ResponseEntity<List<IncidentReport>> getReportsByFilter(
            @ModelAttribute IncidentReportFilter filter) {
        List<IncidentReport> reports = incidentReportService.getReportsByFilter(filter);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<IncidentReport> getReportById(@PathVariable Integer reportId) {
        IncidentReport report = incidentReportService.getReportById(reportId);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/type/{reportType}")
    public ResponseEntity<List<IncidentReport>> getReportsByType(
            @PathVariable String reportType) {
        List<IncidentReport> reports = incidentReportService.getReportsByType(reportType);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<IncidentReport>> getReportsByStatus(
            @PathVariable String status) {
        List<IncidentReport> reports = incidentReportService.getReportsByStatus(status);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<IncidentReport>> getPendingReports() {
        List<IncidentReport> reports = incidentReportService.getPendingReports();
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/pending/count")
    public ResponseEntity<Long> countPendingReports() {
        Long count = incidentReportService.countPendingReports();
        return ResponseEntity.ok(count);
    }
    
    // ==================== EMPLOYEE GHI NHẬN BÁO CÁO TỪ USER ====================

    @PostMapping("/employee-report")
    @Operation(summary = "Employee ghi nhận báo cáo từ user")
    public ResponseEntity<IncidentReport> createReportByEmployee(
            @RequestBody EmployeeCreateReportRequest request) {
        IncidentReport savedReport = incidentReportService.createReportByEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedReport);
    }

    // ==================== XÓA BÁO CÁO ====================

    @DeleteMapping("/{reportId}")
    public ResponseEntity<Void> deleteReport(@PathVariable Integer reportId) {
        incidentReportService.deleteReport(reportId);
        return ResponseEntity.noContent().build();
    }
}