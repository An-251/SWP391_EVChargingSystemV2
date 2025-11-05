package swp391.fa25.swp391.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.ChargingPoint;
import swp391.fa25.swp391.entity.Driver;
import swp391.fa25.swp391.entity.Reservation;

import java.time.Instant;
import java.time.LocalDateTime; // ⭐ IMPORT LocalDateTime
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {


        // ⭐ Đổi parameter từ Instant sang LocalDateTime
        List<Reservation> findByStatusAndEndTimeBefore(String status, LocalDateTime endTime);

        // ⭐ Tìm reservations sắp hết hạn (trong 5 phút)
        @Query("SELECT r FROM Reservation r WHERE r.status = 'ACTIVE' " +
                "AND r.endTime BETWEEN :now AND :fiveMinutesLater")
        List<Reservation> findExpiringReservations(
                @Param("now") Instant now,
                @Param("fiveMinutesLater") Instant fiveMinutesLater
        );

    /**
     * Tìm tất cả Reservation theo Driver
     */
    List<Reservation> findByDriver(Driver driver);

    /**
     * Tìm tất cả Reservation theo Driver ID
     */
    List<Reservation> findByDriver_Id(Integer driverId);

    /**
     * Tìm tất cả Reservation theo trạng thái
     * VD: "ACTIVE", "CANCELLED", "COMPLETED"
     */
    List<Reservation> findByStatus(String status);

    /**
     * Tìm Reservation theo Driver và Status
     */
    List<Reservation> findByDriver_IdAndStatus(Integer driverId, String status);

    /**
     * Tìm Reservation có startTime trong khoảng thời gian
     */
    List<Reservation> findByStartTimeBetween(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * Tìm Reservation có endTime trong khoảng thời gian
     */
    List<Reservation> findByEndTimeBetween(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * Tìm Reservation theo Charging Point
     */
    List<Reservation> findByChargingPoint(ChargingPoint chargingPoint);

    /**
     * Tìm Reservation theo Charging Point ID
     */
    List<Reservation> findByChargingPoint_Id(Integer chargingPointId);

    /**
     * Tìm Reservation theo Charging Station ID (thông qua ChargingPoint)
     * Sử dụng Spring Data JPA method naming convention
     * Đường dẫn: Reservation -> chargingPoint -> station -> id
     */
    List<Reservation> findByChargingPoint_Station_Id(Integer stationId);

    /**
     * Tìm Reservation theo Charging Point và Status
     */
    List<Reservation> findByChargingPoint_IdAndStatus(Integer chargingPointId, String status);

    /**
     * Kiểm tra driver có reservation đang active không
     */
    boolean existsByDriver_IdAndStatus(Integer driverId, String status);

    /**
     * Kiểm tra charging point có reservation trong khoảng thời gian không
     */
    boolean existsByChargingPoint_IdAndStatusAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
            Integer chargingPointId,
            String status,
            LocalDateTime endTime,
            LocalDateTime startTime
    );

    /**
     * Đếm số lượng reservation theo status
     */
    Long countByStatus(String status);

    /**
     * Đếm số lượng reservation của driver
     */
    Long countByDriver_Id(Integer driverId);

    /**
     * Đếm số lượng reservation của charging point
     */
    Long countByChargingPoint_Id(Integer chargingPointId);

    /**
     * Custom query: Tìm reservation xung đột thời gian tại charging point
     * (Overlapping reservations)
     */
    @Query("SELECT r FROM Reservation r WHERE r.chargingPoint.id = :chargingPointId " +
            "AND r.status = 'ACTIVE' " +
            "AND r.startTime < :endTime " +
            "AND r.endTime > :startTime")
    List<Reservation> findConflictingReservations(
            @Param("chargingPointId") Integer chargingPointId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    /**
     * Tìm reservation sắp tới của driver (chưa bắt đầu)
     */
    @Query("SELECT r FROM Reservation r WHERE r.driver.id = :driverId " +
            "AND r.startTime > :currentTime " +
            "AND r.status = 'ACTIVE' " +
            "ORDER BY r.startTime ASC")
    List<Reservation> findUpcomingReservationsByDriver(
            @Param("driverId") Integer driverId,
            @Param("currentTime") LocalDateTime currentTime
    );

    /**
     * Tìm reservation đang diễn ra của driver (ACTIVE và trong khoảng thời gian)
     */
    @Query("SELECT r FROM Reservation r WHERE r.driver.id = :driverId " +
            "AND r.status = 'ACTIVE' " +
            "AND r.startTime <= :currentTime " +
            "AND r.endTime >= :currentTime")
    Optional<Reservation> findActiveReservationByDriver(
            @Param("driverId") Integer driverId,
            @Param("currentTime") LocalDateTime currentTime
    );

    /**
     * Tìm reservation đã quá hạn chưa hoàn thành
     */
    @Query("SELECT r FROM Reservation r WHERE r.endTime < :currentTime " +
            "AND r.status = 'ACTIVE'")
    List<Reservation> findExpiredActiveReservations(@Param("currentTime") LocalDateTime currentTime);

    /**
     * Tìm tất cả reservation của charging point trong ngày cụ thể
     */
    @Query("SELECT r FROM Reservation r WHERE r.chargingPoint.id = :chargingPointId " +
            "AND DATE(r.startTime) = DATE(:date) " +
            "ORDER BY r.startTime ASC")
    List<Reservation> findReservationsByChargingPointAndDate(
            @Param("chargingPointId") Integer chargingPointId,
            @Param("date") LocalDateTime date
    );

    /**
     * Tìm reservation theo driver và khoảng thời gian
     */
    @Query("SELECT r FROM Reservation r WHERE r.driver.id = :driverId " +
            "AND ((r.startTime BETWEEN :startTime AND :endTime) " +
            "OR (r.endTime BETWEEN :startTime AND :endTime) " +
            "OR (r.startTime <= :startTime AND r.endTime >= :endTime))")
    List<Reservation> findDriverReservationsInTimeRange(
            @Param("driverId") Integer driverId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    // Trong ReservationRepository
    List<Reservation> findByDriverId(Long driverId);

    List<Reservation> findByChargingPointId(Integer chargingPointId);

    List<Reservation> findByChargingPointIdAndStatusNot(Integer chargingPointId, String status);

    // ⭐ Tìm reservation đã hết hạn
    @Query("SELECT r FROM Reservation r WHERE r.endTime < :now AND r.status IN :statuses")
    List<Reservation> findExpiredReservations(
            @Param("now") LocalDateTime now,
            @Param("statuses") List<String> statuses
    );

    // ⭐ Tìm reservation đang active
    @Query("SELECT r FROM Reservation r WHERE r.startTime <= :now AND r.endTime > :now AND r.status = 'CONFIRMED'")
    List<Reservation> findActiveReservations(@Param("now") LocalDateTime now);
}