package swp391.fa25.swp391.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.ChargingPoint;

import java.util.List;
import java.util.Optional;

/**
 * Repository cho ChargingPoint
 * Sử dụng JpaRepository
 */
@Repository
public interface ChargingPointRepository extends JpaRepository<ChargingPoint, Integer> {

    // ============================================
    // SIMPLE QUERIES - Spring tự động generate
    // ============================================

    /**
     * Tìm ChargingPoint theo trạng thái (status)
     */
    List<ChargingPoint> findByStatus(String status);

    /**
     * Tìm ChargingPoint theo Station ID
     */
    List<ChargingPoint> findByStationId(Integer stationId);

    // ========== SOFT DELETE METHODS ==========
    @Query("SELECT p FROM ChargingPoint p WHERE (p.isDeleted = false OR p.isDeleted IS NULL)")
    List<ChargingPoint> findAllNotDeleted();

    @Query("SELECT p FROM ChargingPoint p WHERE p.id = :id AND (p.isDeleted = false OR p.isDeleted IS NULL)")
    Optional<ChargingPoint> findByIdNotDeleted(Integer id);

    @Query("SELECT p FROM ChargingPoint p WHERE p.station.id = :stationId AND (p.isDeleted = false OR p.isDeleted IS NULL)")
    List<ChargingPoint> findByStationIdNotDeleted(Integer stationId);
}