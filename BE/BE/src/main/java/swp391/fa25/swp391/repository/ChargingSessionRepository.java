package swp391.fa25.swp391.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.ChargingSession;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository cho ChargingSession
 * Sử dụng JpaRepository - Spring tự động tạo implementation
 */
@Repository
public interface ChargingSessionRepository extends JpaRepository<ChargingSession, Integer> {

    // ============================================
    // SIMPLE QUERIES - Spring tự động generate
    // ============================================

    /**
     * Tìm tất cả sessions của driver, sắp xếp theo thời gian mới nhất
     */
    List<ChargingSession> findByDriverIdOrderByStartTimeDesc(Integer driverId);

    /**
     * Tìm sessions theo status
     */
    List<ChargingSession> findByStatus(String status);

    /**
     * Tìm sessions theo charging point
     */
    List<ChargingSession> findByChargingPointId(Integer chargingPointId);

    /**
     * Tìm sessions theo vehicle
     */
    List<ChargingSession> findByVehicleId(Integer vehicleId);

    /**
     * Đếm số sessions theo status
     */
    Long countByStatus(String status);

    /**
     * Kiểm tra driver có session active không
     */
    Boolean existsByDriverIdAndStatus(Integer driverId, String status);

    /**
     * Pagination theo status
     */
    Page<ChargingSession> findByStatus(String status, Pageable pageable);

    /**
     * Pagination theo driver
     */
    Page<ChargingSession> findByDriverIdOrderByStartTimeDesc(Integer driverId, Pageable pageable);


    // ============================================
    // CUSTOM QUERIES - Viết bằng JPQL
    // ============================================

    /**
     * Tìm session ĐANG ACTIVE của driver
     * Business critical - phải đảm bảo chỉ có 1 session active
     */
    @Query("SELECT cs FROM ChargingSession cs " +
            "WHERE cs.driver.id = :driverId AND cs.status = 'ACTIVE'")
    Optional<ChargingSession> findActiveSessionByDriverId(@Param("driverId") Integer driverId);

    /**
     * Tìm session ĐANG ACTIVE tại charging point
     * Kiểm tra charging point có đang được sử dụng không
     */
    @Query("SELECT cs FROM ChargingSession cs " +
            "WHERE cs.chargingPoint.id = :chargingPointId AND cs.status = 'ACTIVE'")
    Optional<ChargingSession> findActiveSessionByChargingPointId(@Param("chargingPointId") Integer chargingPointId);

    /**
     * Tìm sessions hoàn thành trong khoảng thời gian
     * Dùng cho báo cáo, thống kê
     */
//    @Query("SELECT cs FROM ChargingSession cs " +
//            "WHERE cs.status = 'COMPLETED' " +
//            "AND cs.startTime BETWEEN :startDate AND :endDate " +
//            "ORDER BY cs.startTime DESC")
//    List<ChargingSession> findCompletedSessionsBetween(
//            @Param("startDate") LocalDateTime startDate,
//            @Param("endDate") LocalDateTime endDate);

    /**
     * Tính tổng doanh thu của driver
     */
    @Query("SELECT COALESCE(SUM(cs.cost), 0) FROM ChargingSession cs " +
            "WHERE cs.driver.id = :driverId AND cs.status = 'COMPLETED'")
    BigDecimal calculateTotalCostByDriver(@Param("driverId") Integer driverId);

    /**
     * Tính tổng kWh đã sử dụng tại charging point
     */
//    @Query("SELECT COALESCE(SUM(cs.kwhUsed), 0) FROM ChargingSession cs " +
//            "WHERE cs.chargingPoint.id = :chargingPointId AND cs.status = 'COMPLETED'")
//    BigDecimal calculateTotalKwhByChargingPoint(@Param("chargingPointId") Integer chargingPointId);

    /**
     * Thống kê theo charging point trong khoảng thời gian
     * Trả về: [pointId, pointName, sessionCount, totalKwh, totalRevenue]
     */
//    @Query("SELECT cs.chargingPoint.id, cs.chargingPoint.pointName, " +
//            "COUNT(cs), COALESCE(SUM(cs.kwhUsed), 0), COALESCE(SUM(cs.cost), 0) " +
//            "FROM ChargingSession cs " +
//            "WHERE cs.status = 'COMPLETED' " +
//            "AND cs.startTime BETWEEN :startDate AND :endDate " +
//            "GROUP BY cs.chargingPoint.id, cs.chargingPoint.pointName " +
//            "ORDER BY COUNT(cs) DESC")
//    List<Object[]> getChargingPointStatistics(
//            @Param("startDate") LocalDateTime startDate,
//            @Param("endDate") LocalDateTime endDate);

    /**
     * Lấy sessions gần đây với eager loading để tránh N+1 query
     * Fetch join các entity liên quan
     */
//    @Query("SELECT cs FROM ChargingSession cs " +
//            "LEFT JOIN FETCH cs.driver " +
//            "LEFT JOIN FETCH cs.vehicle " +
//            "LEFT JOIN FETCH cs.chargingPoint cp " +
//            "LEFT JOIN FETCH cp.station " +
//            "WHERE cs.driver.id = :driverId " +
//            "ORDER BY cs.startTime DESC")
//    List<ChargingSession> findRecentSessionsWithDetails(
//            @Param("driverId") Integer driverId,
//            Pageable pageable);
}