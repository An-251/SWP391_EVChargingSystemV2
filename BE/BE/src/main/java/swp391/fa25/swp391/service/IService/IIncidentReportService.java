package swp391.fa25.swp391.service.IService;

import swp391.fa25.swp391.dto.request.*;
import swp391.fa25.swp391.entity.IncidentReport; // CẬP NHẬT: Import Entity

import java.util.List;

public interface IIncidentReportService {

    // Hướng 1: User báo lỗi (Trả về Entity)
    IncidentReport createUserReport(UserReportRequest request);

    // Hướng 2: System tự động báo lỗi (Trả về Entity)
    IncidentReport createSystemReport(SystemReportRequest request);

    // Employee xử lý báo cáo (Trả về Entity)
    IncidentReport handleReport(HandleReportRequest request);

    // Admin xem tất cả báo cáo (Trả về List Entity)
    List<IncidentReport> getAllReports();

    // Admin xem báo cáo với filter (Trả về List Entity)
    List<IncidentReport> getReportsByFilter(IncidentReportFilter filter);

    // Xem chi tiết 1 báo cáo (Trả về Entity)
    IncidentReport getReportById(Integer reportId);

    // Lấy báo cáo theo loại (Trả về List Entity)
    List<IncidentReport> getReportsByType(String reportType);

    // Lấy báo cáo theo status (Trả về List Entity)
    List<IncidentReport> getReportsByStatus(String status);

    // Lấy báo cáo chưa xử lý (Trả về List Entity)
    List<IncidentReport> getPendingReports();

    // Đếm số báo cáo chưa xử lý
    Long countPendingReports();

    // Cập nhật status báo cáo (Trả về Entity)
    IncidentReport updateReportStatus(Integer reportId, String status);

    // Gán employee xử lý (Trả về Entity)
    IncidentReport assignEmployee(Integer reportId, Integer employeeId);

    // Đóng báo cáo với ghi chú giải quyết (Trả về Entity)
    IncidentReport closeReport(Integer reportId, String resolutionNotes);

    // Xóa báo cáo
    void deleteReport(Integer reportId);
}