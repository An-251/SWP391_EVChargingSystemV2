package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Quan trọng
import swp391.fa25.swp391.dto.request.*;
import swp391.fa25.swp391.entity.ChargingPoint;
import swp391.fa25.swp391.entity.IncidentReport;
import swp391.fa25.swp391.entity.StationEmployee;
import swp391.fa25.swp391.repository.ChargingPointRepository;
import swp391.fa25.swp391.repository.IncidentReportRepository;
import swp391.fa25.swp391.repository.StationEmployeeRepository;
import swp391.fa25.swp391.service.IService.IIncidentReportService;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IncidentReportService implements IIncidentReportService {

    private final IncidentReportRepository incidentReportRepository;
    private final ChargingPointRepository chargingPointRepository;
    private final StationEmployeeRepository stationEmployeeRepository;

    @Override
    @Transactional
    public IncidentReport createUserReport(UserReportRequest request) {
        // CẬP NHẬT: Dùng RuntimeException
        ChargingPoint point = chargingPointRepository.findById(request.getPointId())
                .orElseThrow(() -> new RuntimeException("Charging point not found with id: " + request.getPointId()));

        IncidentReport report = new IncidentReport();
        report.setReportDate(Instant.now());
        report.setDescription(request.getDescription());
        report.setSeverity(request.getSeverity());
        report.setStatus("PENDING");
        report.setReportType("USER_REPORTED");
        report.setReporterUserId(request.getReporterUserId());
        report.setReporterName(request.getReporterName());
        report.setReporterEmail(request.getReporterEmail());
        report.setPoint(point);

        return incidentReportRepository.save(report);
    }

    @Override
    @Transactional
    public IncidentReport createSystemReport(SystemReportRequest request) {
        // CẬP NHẬT: Dùng RuntimeException
        ChargingPoint point = chargingPointRepository.findById(request.getPointId())
                .orElseThrow(() -> new RuntimeException("Charging point not found with id: " + request.getPointId()));

        IncidentReport report = new IncidentReport();
        report.setReportDate(Instant.now());
        report.setDescription(request.getDescription());
        report.setSeverity(request.getSeverity());
        report.setStatus("PENDING");
        report.setReportType("SYSTEM_DETECTED");
        report.setPoint(point);

        return incidentReportRepository.save(report);
    }

    @Override
    @Transactional
    public IncidentReport handleReport(HandleReportRequest request) {
        // CẬP NHẬT: Dùng RuntimeException
        IncidentReport report = incidentReportRepository.findById(request.getReportId())
                .orElseThrow(() -> new RuntimeException("Report not found with id: " + request.getReportId()));

        if (request.getEmployeeId() != null) {
            // CẬP NHẬT: Dùng RuntimeException
            StationEmployee employee = stationEmployeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new RuntimeException("Employee not found with id: " + request.getEmployeeId()));
            report.setEmployee(employee);
        }

        if (request.getStatus() != null) {
            report.setStatus(request.getStatus());
            if ("RESOLVED".equals(request.getStatus()) || "CLOSED".equals(request.getStatus())) {
                report.setResolvedDate(Instant.now());
            }
        }

        if (request.getResolutionNotes() != null) {
            report.setResolutionNotes(request.getResolutionNotes());
        }

        return incidentReportRepository.save(report);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidentReport> getAllReports() {
        return incidentReportRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidentReport> getReportsByFilter(IncidentReportFilter filter) {
        return incidentReportRepository.findByFilters(
                filter.getReportType(),
                filter.getStatus(),
                filter.getSeverity(),
                filter.getPointId(),
                filter.getStationId(),
                filter.getStartDate(),
                filter.getEndDate()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public IncidentReport getReportById(Integer reportId) {
        // CẬP NHẬT: Dùng RuntimeException
        return incidentReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found with id: " + reportId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidentReport> getReportsByType(String reportType) {
        return incidentReportRepository.findByReportType(reportType);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidentReport> getReportsByStatus(String status) {
        return incidentReportRepository.findByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidentReport> getPendingReports() {
        return getReportsByStatus("PENDING");
    }

    @Override
    public Long countPendingReports() {
        return incidentReportRepository.countPendingReports();
    }

    @Override
    @Transactional
    public IncidentReport updateReportStatus(Integer reportId, String status) {
        IncidentReport report = getReportById(reportId); // Sẽ throw RuntimeException nếu không tìm thấy
        report.setStatus(status);
        if ("RESOLVED".equals(status) || "CLOSED".equals(status)) {
            report.setResolvedDate(Instant.now());
        }
        return incidentReportRepository.save(report);
    }

    @Override
    @Transactional
    public IncidentReport assignEmployee(Integer reportId, Integer employeeId) {
        IncidentReport report = getReportById(reportId); // Sẽ throw RuntimeException nếu không tìm thấy

        // CẬP NHẬT: Dùng RuntimeException
        StationEmployee employee = stationEmployeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

        report.setEmployee(employee);
        report.setStatus("IN_PROGRESS");
        return incidentReportRepository.save(report);
    }

    @Override
    @Transactional
    public IncidentReport closeReport(Integer reportId, String resolutionNotes) {
        IncidentReport report = getReportById(reportId); // Sẽ throw RuntimeException nếu không tìm thấy
        report.setStatus("CLOSED");
        report.setResolvedDate(Instant.now());
        report.setResolutionNotes(resolutionNotes);
        return incidentReportRepository.save(report);
    }

    @Override
    @Transactional
    public void deleteReport(Integer reportId) {
        if (!incidentReportRepository.existsById(reportId)) {
            // CẬP NHẬT: Dùng RuntimeException
            throw new RuntimeException("Report not found with id: " + reportId);
        }
        incidentReportRepository.deleteById(reportId);
    }

    @Override
    @Transactional
    public IncidentReport createReportByEmployee(EmployeeCreateReportRequest request) {
        // Kiểm tra charging point
        ChargingPoint point = chargingPointRepository.findById(request.getPointId())
                .orElseThrow(() -> new RuntimeException("Charging point not found with id: " + request.getPointId()));

        // Kiểm tra employee (optional - nếu muốn validate)
        if (request.getEmployeeId() != null) {
            StationEmployee employee = stationEmployeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new RuntimeException("Employee not found with id: " + request.getEmployeeId()));
        }

        IncidentReport report = new IncidentReport();
        report.setReportDate(Instant.now());
        report.setDescription(request.getDescription());
        report.setSeverity(request.getSeverity());
        report.setStatus("PENDING"); // Để admin xử lý sau
        report.setReportType("USER_REPORTED"); // Vẫn là user reported

        // Thông tin user
        report.setReporterUserId(request.getReporterUserId());
        report.setReporterName(request.getReporterName());
        report.setReporterEmail(request.getReporterEmail());

        // Ghi chú của employee (nếu có)
        if (request.getEmployeeNotes() != null) {
            report.setResolutionNotes("Employee notes: " + request.getEmployeeNotes());
        }

        report.setPoint(point);

        return incidentReportRepository.save(report);
    }
}