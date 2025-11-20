package swp391.fa25.swp391.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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

    // ========== SOFT DELETE METHODS ==========
    @Query("SELECT c FROM Charger c WHERE (c.isDeleted = false OR c.isDeleted IS NULL)")
    List<Charger> findAllNotDeleted();

    @Query("SELECT c FROM Charger c WHERE c.id = :id AND (c.isDeleted = false OR c.isDeleted IS NULL)")
    Optional<Charger> findByIdNotDeleted(Integer id);

    @Query("SELECT c FROM Charger c WHERE c.chargingPoint.id = :chargingPointId AND (c.isDeleted = false OR c.isDeleted IS NULL)")
    List<Charger> findByChargingPointIdNotDeleted(Integer chargingPointId);
}
