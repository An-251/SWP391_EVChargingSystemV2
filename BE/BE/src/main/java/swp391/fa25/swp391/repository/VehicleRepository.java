package swp391.fa25.swp391.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.Vehicle;
import java.util.List;

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
    List<Vehicle> findByEnterpriseId(Integer enterpriseId);
}