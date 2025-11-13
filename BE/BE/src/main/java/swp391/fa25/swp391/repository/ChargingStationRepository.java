package swp391.fa25.swp391.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.ChargingStation;

import java.util.List;
import java.util.Optional;

/**
 * Repository cho ChargingStation
 * Kế thừa JpaRepository để sử dụng các phương thức chuẩn của Spring Data JPA.
 */
@Repository
public interface ChargingStationRepository extends JpaRepository<ChargingStation, Integer> {

    /**
     * Kiểm tra ChargingStation có tồn tại theo tên trạm
     * Phương thức này thay thế cho findByField("name", stationName) trong Service
     */
    boolean existsByStationName(String stationName);
    
    /**
     * ⭐ NEW: Find all stations by facility ID
     */
    List<ChargingStation> findByFacility_Id(Integer facilityId);
}