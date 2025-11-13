package swp391.fa25.swp391.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.IncidentReport;
import java.time.Instant;
import java.util.List;

@Repository
public interface IncidentReportRepository extends JpaRepository<IncidentReport, Integer> {

    List<IncidentReport> findByReportType(String reportType);
    List<IncidentReport> findByStatus(String status);
    List<IncidentReport> findBySeverity(String severity);
    List<IncidentReport> findByPointId(Integer pointId);
    List<IncidentReport> findByEmployeeId(Integer employeeId);
    List<IncidentReport> findByReportDateBetween(Instant startDate, Instant endDate);

    // Query to find incidents by station
    @Query("SELECT ir FROM IncidentReport ir WHERE ir.station.id = :stationId")
    List<IncidentReport> findByStationId(@Param("stationId") Integer stationId);

    // ==========================================================
    // (CẬP NHẬT) Sửa lại câu query để hỗ trợ lọc theo stationId
    // ==========================================================
    @Query("SELECT ir FROM IncidentReport ir " +
            "JOIN ir.point p " + // JOIN với ChargingPoint
            "JOIN p.station s " + // JOIN với Station
            "WHERE (:reportType IS NULL OR ir.reportType = :reportType) " +
            "AND (:status IS NULL OR ir.status = :status) " +
            "AND (:severity IS NULL OR ir.severity = :severity) " +
            "AND (:pointId IS NULL OR p.id = :pointId) " +
            "AND (:stationId IS NULL OR s.id = :stationId) " + // Dòng này đã được thêm
            "AND (:startDate IS NULL OR ir.reportDate >= :startDate) " +
            "AND (:endDate IS NULL OR ir.reportDate <= :endDate) " +
            "ORDER BY ir.reportDate DESC")
    List<IncidentReport> findByFilters(
            @Param("reportType") String reportType,
            @Param("status") String status,
            @Param("severity") String severity,
            @Param("pointId") Integer pointId,
            @Param("stationId") Integer stationId, // Thêm param này
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );

    @Query("SELECT COUNT(ir) FROM IncidentReport ir WHERE LOWER(ir.status) = 'pending'")
    Long countPendingReports();

    List<IncidentReport> findTop10ByOrderByReportDateDesc();
}