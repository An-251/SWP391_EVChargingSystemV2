package swp391.fa25.swp391.repository.models;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.Vehicle;

import java.util.List;
import java.util.Optional;

/**
 * Repository cho Vehicle
 * Sử dụng JpaRepository
 */
@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {

    // ============================================
    // SIMPLE QUERIES - Spring tự động generate
    // ============================================

    /**
     * Tìm Vehicle theo biển số xe (license plate)
     */
    Optional<Vehicle> findByLicensePlate(String licensePlate);

    /**
     * Tìm tất cả Vehicle của một Driver
     */
    List<Vehicle> findByDriverId(Integer driverId);

    /**
     * Kiểm tra tồn tại theo biển số xe
     */
    boolean existsByLicensePlate(String licensePlate);

    // Bạn có thể thêm các phương thức tìm kiếm khác
}