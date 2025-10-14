package swp391.fa25.swp391.repository.models;

import org.springframework.data.jpa.repository.JpaRepository;
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

    /**
     * Kiểm tra ChargingPoint có tồn tại theo ID và Status
     */
    boolean existsByIdAndStatus(Integer id, String status);

    // Có thể thêm các queries khác tùy theo nhu cầu
}