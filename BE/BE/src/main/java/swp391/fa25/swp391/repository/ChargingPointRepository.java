package swp391.fa25.swp391.repository;

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
}