package swp391.fa25.swp391.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.SubscriptionPlan;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Integer> {

    /**
     * Tìm SubscriptionPlan theo tên (chứa keyword)
     */
    List<SubscriptionPlan> findByPlanNameContaining(String keyword);

    /**
     * Tìm gói Basic (default)
     */
    Optional<SubscriptionPlan> findByIsDefault(Boolean isDefault);

    /**
     * ⭐ Tìm gói Basic cho targetUserType cụ thể
     */
    Optional<SubscriptionPlan> findByIsDefaultAndTargetUserType(Boolean isDefault, String targetUserType);

    /**
     * ⭐ Tìm tất cả gói theo targetUserType
     */
    List<SubscriptionPlan> findByTargetUserType(String targetUserType);

    // ========== SOFT DELETE METHODS ==========
    @Query("SELECT s FROM SubscriptionPlan s WHERE (s.isDeleted = false OR s.isDeleted IS NULL)")
    List<SubscriptionPlan> findAllNotDeleted();

    @Query("SELECT s FROM SubscriptionPlan s WHERE s.id = :id AND (s.isDeleted = false OR s.isDeleted IS NULL)")
    Optional<SubscriptionPlan> findByIdNotDeleted(Integer id);

    @Query("SELECT s FROM SubscriptionPlan s WHERE s.targetUserType = :targetUserType AND (s.isDeleted = false OR s.isDeleted IS NULL)")
    List<SubscriptionPlan> findByTargetUserTypeNotDeleted(String targetUserType);
}