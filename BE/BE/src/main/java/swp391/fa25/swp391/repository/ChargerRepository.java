package swp391.fa25.swp391.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.Charger;

import java.util.List;
import java.util.Optional;

/**
 * Repository cho Charger
 * @author SWP391 Team
 */

@Repository
public interface ChargerRepository extends JpaRepository<Charger, Integer> {

    /**
     * Tìm Charger theo trạng thái (status)
     */
    List<Charger> findByStatus(String status);

    /**
     * Tìm Charger theo Charging Point ID
     */
    List<Charger> findByChargingPointId(Integer chargingPointId);

    /**
     * Kiểm tra Charger có tồn tại theo ID và Status
     */
    boolean existsByIdAndStatus(Integer id, String status);

    /**
     * Tìm Charger theo charger code
     */
    Optional<Charger> findByChargerCode(String chargerCode);

    /**
     * Tìm tất cả Charger theo trạng thái và charging point
     */
    List<Charger> findByChargingPointIdAndStatus(Integer chargingPointId, String status);
}
