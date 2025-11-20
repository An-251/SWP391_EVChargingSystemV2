package swp391.fa25.swp391.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.Vehicle;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {

    /**
     * Tìm tất cả xe của một driver
     */
    List<Vehicle> findByDriverId(Integer driverId);

    /**
     * Đếm số lượng xe của một driver
     */
    int countByDriverId(Integer driverId);

    /**
     * Kiểm tra biển số xe đã tồn tại chưa
     */
    boolean existsByLicensePlate(String licensePlate);

    // ========== SOFT DELETE METHODS ==========
    @Query("SELECT v FROM Vehicle v WHERE (v.isDeleted = false OR v.isDeleted IS NULL)")
    List<Vehicle> findAllNotDeleted();

    @Query("SELECT v FROM Vehicle v WHERE v.id = :id AND (v.isDeleted = false OR v.isDeleted IS NULL)")
    Optional<Vehicle> findByIdNotDeleted(Integer id);

    @Query("SELECT v FROM Vehicle v WHERE v.driver.id = :driverId AND (v.isDeleted = false OR v.isDeleted IS NULL)")
    List<Vehicle> findByDriverIdNotDeleted(Integer driverId);
}