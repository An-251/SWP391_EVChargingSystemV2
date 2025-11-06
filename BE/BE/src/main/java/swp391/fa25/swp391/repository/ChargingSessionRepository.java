
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



    /**
     * Tìm tất cả sessions của driver, sắp xếp theo thời gian mới nhất
     */
    List<ChargingSession> findByDriverIdOrderByStartTimeDesc(Integer driverId);

    /**
     * Tìm sessions theo status
     */
    List<ChargingSession> findByStatus(String status);



    /**
     * Đếm số sessions theo status
     */
    Long countByStatus(String status);

    /**
     * Kiểm tra driver có session active không
     */
    Boolean existsByDriverIdAndStatus(Integer driverId, String status);

    /**
     * Pagination theo driver
     */
    Page<ChargingSession> findByDriverIdOrderByStartTimeDesc(Integer driverId, Pageable pageable);



    /**
     * Tìm session ĐANG ACTIVE của driver (status = using)
     * Business critical - phải đảm bảo chỉ có 1 session active
     */
    @Query("SELECT cs FROM ChargingSession cs " +
            "WHERE cs.driver.id = :driverId AND cs.status = 'using'")
    Optional<ChargingSession> findActiveSessionByDriverId(@Param("driverId") Integer driverId);

    /**
     * Tìm session ĐANG ACTIVE tại charger (status = using)
     * Kiểm tra charger có đang được sử dụng không
     */
    @Query("SELECT cs FROM ChargingSession cs " +
            "WHERE cs.charger.id = :chargerId AND cs.status = 'using'")
    Optional<ChargingSession> findActiveSessionByChargerId(@Param("chargerId") Integer chargerId);


    /**
     * Tính tổng doanh thu của driver (chỉ session đã kết thúc = inactive với cost > 0)
     */
    @Query("SELECT COALESCE(SUM(cs.cost), 0) FROM ChargingSession cs " +
            "WHERE cs.driver.id = :driverId AND cs.status = 'inactive'")
    BigDecimal calculateTotalCostByDriver(@Param("driverId") Integer driverId);

// Thêm vào interface ChargingSessionRepository


    /**
     * Tìm các session chưa có invoice của một driver trong khoảng thời gian
     */
    @Query("SELECT cs FROM ChargingSession cs WHERE cs.driver.id = :driverId " +
            "AND cs.invoice IS NULL " +
            "AND cs.status = 'completed' " +
            "AND cs.startTime BETWEEN :startDate AND :endDate")
    List<ChargingSession> findUnbilledSessionsByDriverAndDateRange(
            @Param("driverId") Integer driverId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
    /**
     * ⭐ Đếm số session chưa có invoice trong khoảng thời gian
     */
    long countByDriverIdAndInvoiceIsNullAndStartTimeBetween(
            Integer driverId,
            LocalDateTime startTime,
            LocalDateTime endTime
    );

    List<ChargingSession> findByVehicleIdAndStatusAndEndTimeBetweenAndEnterpriseInvoiceIsNull(
            Integer vehicleId,
            String status,
            LocalDateTime startTime,
            LocalDateTime endTime
    );
}
