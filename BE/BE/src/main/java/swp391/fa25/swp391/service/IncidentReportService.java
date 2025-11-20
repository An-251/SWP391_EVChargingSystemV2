package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Quan trọng
import swp391.fa25.swp391.dto.request.*;
import swp391.fa25.swp391.entity.Charger; // NEW
import swp391.fa25.swp391.entity.ChargingPoint;
import swp391.fa25.swp391.entity.IncidentReport;
import swp391.fa25.swp391.entity.StationEmployee;
import swp391.fa25.swp391.repository.ChargerRepository; // NEW
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
    private final ChargerRepository chargerRepository; // NEW
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
        report.setStatus("pending");
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
        report.setStatus("pending");
        report.setReportType("SYSTEM_DETECTED");
        report.setPoint(point);

        return incidentReportRepository.save(report);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidentReport> getAllReports() {
        return incidentReportRepository.findAllNotDeleted();
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
        return incidentReportRepository.findByIdNotDeleted(reportId)
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
        report.setStatus(status.toLowerCase()); // Chuẩn hóa thành lowercase
        if ("resolved".equalsIgnoreCase(status) || "closed".equalsIgnoreCase(status)) {
            report.setResolvedDate(Instant.now());
        }
        return incidentReportRepository.save(report);
    }

    @Override
    @Transactional
    public IncidentReport closeReport(Integer reportId, String resolutionNotes) {
        IncidentReport report = getReportById(reportId); // Sẽ throw RuntimeException nếu không tìm thấy
        report.setStatus("closed"); // lowercase
        report.setResolvedDate(Instant.now());
        report.setResolutionNotes(resolutionNotes);
        
        // NEW: Khi admin close report → đổi status về ACTIVE (lowercase)
        ChargingPoint point = report.getPoint();
        Charger charger = report.getCharger();
        
        if (charger != null) {
            // Nếu report là cho charger cụ thể → chỉ đổi status charger về active
            charger.setStatus("active");
            chargerRepository.save(charger);
        } else if (point != null) {
            // Nếu report là cho charging point → đổi status point + tất cả chargers về active
            point.setStatus("active");
            chargingPointRepository.save(point);
            
            List<Charger> chargers = chargerRepository.findByChargingPointId(point.getId());
            for (Charger c : chargers) {
                c.setStatus("active"); // lowercase
                chargerRepository.save(c);
            }
        }
        
        return incidentReportRepository.save(report);
    }

    @Override
    @Transactional
    public void deleteReport(Integer reportId) {
        IncidentReport report = incidentReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found with id: " + reportId));
        
        // SOFT DELETE
        report.setIsDeleted(true);
        report.setDeletedAt(java.time.Instant.now());
        
        // Lấy username của người thực hiện xóa
        org.springframework.security.core.Authentication auth = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            report.setDeletedBy(auth.getName());
        }
        
        incidentReportRepository.save(report);
    }

    @Override
    @Transactional
    public IncidentReport createReportByEmployee(EmployeeCreateReportRequest request) {
        // Kiểm tra charging point
        ChargingPoint point = chargingPointRepository.findById(request.getPointId())
                .orElseThrow(() -> new RuntimeException("Charging point not found with id: " + request.getPointId()));

        // Tìm employee (nếu có employeeId)
        StationEmployee employee = null;
        if (request.getEmployeeId() != null) {
            employee = stationEmployeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new RuntimeException("Employee not found with id: " + request.getEmployeeId()));
        }

        IncidentReport report = new IncidentReport();
        report.setReportDate(Instant.now());
        report.setDescription(request.getDescription());
        report.setSeverity(request.getSeverity());
        report.setStatus("pending"); // Để admin xử lý sau
        report.setReportType("USER_REPORTED"); // Vẫn là user reported

        // Thông tin user
        report.setReporterUserId(request.getReporterUserId());
        report.setReporterName(request.getReporterName());
        report.setReporterEmail(request.getReporterEmail());

        // Ghi chú của employee (nếu có)
        if (request.getEmployeeNotes() != null) {
            report.setResolutionNotes("Employee notes: " + request.getEmployeeNotes());
        }

        // FIX: Set relationships BEFORE saving (required for queries)
        report.setPoint(point);
        report.setStation(point.getStation());
        if (employee != null) {
            report.setEmployee(employee);
        }

        // NEW: Xử lý thay đổi status dựa trên reportTarget
        String reportTarget = request.getReportTarget();
        
        if ("CHARGING_POINT".equalsIgnoreCase(reportTarget)) {
            // Báo cáo sự cố của Charging Point → Đổi status Point + tất cả Chargers
            point.setStatus("maintenance"); // lowercase
            chargingPointRepository.save(point);
            
            // Đổi status tất cả chargers thuộc point này
            List<Charger> chargers = chargerRepository.findByChargingPointId(point.getId());
            for (Charger charger : chargers) {
                charger.setStatus("maintenance"); // lowercase
                chargerRepository.save(charger);
            }
            
            report.setTitle("Charging Point Issue: " + point.getPointName());
            
        } else if ("CHARGER".equalsIgnoreCase(reportTarget) && request.getChargerId() != null) {
            // Báo cáo sự cố của Charger cụ thể → Chỉ đổi status charger đó
            Charger charger = chargerRepository.findById(request.getChargerId())
                    .orElseThrow(() -> new RuntimeException("Charger not found with id: " + request.getChargerId()));
            
            charger.setStatus("maintenance"); // lowercase
            chargerRepository.save(charger);
            
            report.setCharger(charger);
            report.setTitle("Charger Issue: Charger #" + charger.getChargerCode());
            
        } else {
            // Default: nếu không có reportTarget hoặc không hợp lệ
            report.setTitle("Incident Report");
        }

        return incidentReportRepository.save(report);
    }

    @Override
    public List<IncidentReport> getReportsByEmployee(Integer employeeId) {
        return incidentReportRepository.findByEmployeeId(employeeId);
    }

    @Override
    public List<IncidentReport> getReportsByStation(Integer stationId) {
        return incidentReportRepository.findByStationId(stationId);
    }

    @Override
    public List<IncidentReport> getReportsByStationAndStatus(Integer stationId, String status) {
        return incidentReportRepository.findByStationId(stationId).stream()
                .filter(report -> status.equalsIgnoreCase(report.getStatus()))
                .collect(java.util.stream.Collectors.toList());
    }
}