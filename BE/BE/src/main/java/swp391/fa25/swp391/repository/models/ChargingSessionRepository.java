package swp391.fa25.swp391.repository.models;

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

@Repository
public interface ChargingSessionRepository extends JpaRepository<ChargingSession, Integer> {

    // ============================================
    // PHẦN 1: Simple Queries - JPA tự động generate
    // ============================================
    // Rule: Dùng khi query ĐƠN GIẢN, 1-2 điều kiện, không cần logic phức tạp

    /**
     * Tìm tất cả sessions của driver (sắp xếp theo thời gian mới nhất)
     * JPA tự động tạo: WHERE driver_id = ? ORDER BY start_time DESC
     */
    List<ChargingSession> findByDriverIdOrderByStartTimeDesc(Integer driverId);

    /**
     * Tìm theo status
     * JPA tự động tạo: WHERE status = ?
     */
    List<ChargingSession> findByStatus(String status);

    /**
     * Tìm theo charging point ID
     * JPA tự động tạo: WHERE charging_point_id = ?
     */
    List<ChargingSession> findByChargingPointId(Integer chargingPointId);

    /**
     * Tìm theo vehicle ID
     * JPA tự động tạo: WHERE vehicle_id = ?
     */
    List<ChargingSession> findByVehicleId(Integer vehicleId);

    /**
     * Tìm trong khoảng thời gian
     * JPA tự động tạo: WHERE start_time BETWEEN ? AND ?
     */
    List<ChargingSession> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Tìm sessions có cost lớn hơn
     * JPA tự động tạo: WHERE cost > ?
     */
    List<ChargingSession> findByCostGreaterThan(BigDecimal minCost);

    /**
     * Đếm số session theo status
     * JPA tự động tạo: SELECT COUNT(*) WHERE status = ?
     */
    Long countByStatus(String status);

    /**
     * Kiểm tra tồn tại
     * JPA tự động tạo: SELECT EXISTS(SELECT 1 WHERE driver_id = ? AND status = ?)
     */
    Boolean existsByDriverIdAndStatus(Integer driverId, String status);

    /**
     * Pagination với status
     * JPA tự động tạo: WHERE status = ? + pagination
     */
    Page<ChargingSession> findByStatus(String status, Pageable pageable);


    // ============================================
    // PHẦN 2: Complex Queries - Custom @Query
    // ============================================
    // Rule: Dùng khi cần logic PHỨC TẠP, nhiều điều kiện, JOIN, aggregate, hoặc optimize performance

    /**
     * Tìm session ĐANG ACTIVE của driver
     * Custom vì: Cần 2 điều kiện AND + rõ ràng về business logic
     */
    @Query("SELECT cs FROM ChargingSession cs " +
            "WHERE cs.driver.id = :driverId AND cs.status = 'ACTIVE'")
    Optional<ChargingSession> findActiveSessionByDriverId(@Param("driverId") Integer driverId);

    /**
     * Tìm session ĐANG ACTIVE tại charging point
     * Custom vì: Cần 2 điều kiện AND + business critical query
     */
    @Query("SELECT cs FROM ChargingSession cs " +
            "WHERE cs.chargingPoint.id = :chargingPointId AND cs.status = 'ACTIVE'")
    Optional<ChargingSession> findActiveSessionByChargingPointId(@Param("chargingPointId") Integer chargingPointId);

    /**
     * Tìm sessions hoàn thành trong khoảng thời gian
     * Custom vì: 3 điều kiện + BETWEEN + rõ ràng hơn
     */
    @Query("SELECT cs FROM ChargingSession cs " +
            "WHERE cs.status = 'COMPLETED' " +
            "AND cs.startTime BETWEEN :startDate AND :endDate " +
            "ORDER BY cs.startTime DESC")
    List<ChargingSession> findCompletedSessionsBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Tính tổng doanh thu của driver
     * Custom vì: Aggregate function SUM
     */
    @Query("SELECT COALESCE(SUM(cs.cost), 0) FROM ChargingSession cs " +
            "WHERE cs.driver.id = :driverId AND cs.status = 'COMPLETED'")
    BigDecimal calculateTotalCostByDriver(@Param("driverId") Integer driverId);

    /**
     * Tính tổng kWh sử dụng tại charging point
     * Custom vì: Aggregate function SUM
     */
    @Query("SELECT COALESCE(SUM(cs.kwhUsed), 0) FROM ChargingSession cs " +
            "WHERE cs.chargingPoint.id = :chargingPointId AND cs.status = 'COMPLETED'")
    BigDecimal calculateTotalKwhByChargingPoint(@Param("chargingPointId") Integer chargingPointId);

    /**
     * Thống kê theo driver (id, tên, số lần sạc, tổng chi phí)
     * Custom vì: GROUP BY + multiple aggregates
     */
    @Query("SELECT cs.driver.id, COUNT(cs), COALESCE(SUM(cs.cost), 0) " +
            "FROM ChargingSession cs " +
            "WHERE cs.status = 'COMPLETED' " +
            "GROUP BY cs.driver.id " +
            "ORDER BY COUNT(cs) DESC")
    List<Object[]> findTopDriversByUsage(Pageable pageable);

    /**
     * Thống kê theo charging point
     * Custom vì: Complex aggregate với multiple conditions
     */
    @Query("SELECT cs.chargingPoint.id, cs.chargingPoint.pointName, " +
            "COUNT(cs), COALESCE(SUM(cs.kwhUsed), 0), COALESCE(SUM(cs.cost), 0) " +
            "FROM ChargingSession cs " +
            "WHERE cs.status = 'COMPLETED' " +
            "AND cs.startTime BETWEEN :startDate AND :endDate " +
            "GROUP BY cs.chargingPoint.id, cs.chargingPoint.pointName " +
            "ORDER BY COUNT(cs) DESC")
    List<Object[]> findChargingPointStatistics(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Tìm sessions gần đây của driver với JOIN eager loading
     * Custom vì: Cần fetch join để tránh N+1 query problem
     */
    @Query("SELECT cs FROM ChargingSession cs " +
            "LEFT JOIN FETCH cs.chargingPoint cp " +
            "LEFT JOIN FETCH cp.station " +
            "WHERE cs.driver.id = :driverId " +
            "ORDER BY cs.startTime DESC")
    List<ChargingSession> findRecentSessionsWithDetails(@Param("driverId") Integer driverId, Pageable pageable);


    // ============================================
    // PHẦN 3: Native SQL - Khi cần performance tối đa
    // ============================================
    // Rule: Chỉ dùng khi JPQL không đủ hoặc cần optimize cực mạnh

    /**
     * Native SQL cho performance cao
     * Dùng khi: Query phức tạp với database-specific features
     */
    @Query(value = "SELECT cs.* FROM CHARGING_SESSION cs " +
            "WHERE cs.DRIVER_ID = :driverId " +
            "AND cs.STATUS = 'ACTIVE' " +
            "LIMIT 1",
            nativeQuery = true)
    Optional<ChargingSession> findActiveSessionNative(@Param("driverId") Integer driverId);

    /**
     * Dashboard statistics - Native SQL cho tốc độ
     */
    @Query(value = "SELECT " +
            "DATE(START_TIME) as date, " +
            "COUNT(*) as total_sessions, " +
            "SUM(KWH_USED) as total_kwh, " +
            "SUM(COST) as total_revenue " +
            "FROM CHARGING_SESSION " +
            "WHERE STATUS = 'COMPLETED' " +
            "AND START_TIME BETWEEN :startDate AND :endDate " +
            "GROUP BY DATE(START_TIME) " +
            "ORDER BY date DESC",
            nativeQuery = true)
    List<Object[]> getDailyStatistics(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}