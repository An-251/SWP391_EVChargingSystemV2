package swp391.fa25.swp391.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import swp391.fa25.swp391.entity.SubscriptionPlan;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Integer> {



    /**
     * Tìm SubscriptionPlan theo tên (chứa keyword)
     */
    List<SubscriptionPlan> findByPlanNameContaining(String keyword);

}