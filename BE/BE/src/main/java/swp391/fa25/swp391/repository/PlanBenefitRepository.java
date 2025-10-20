package swp391.fa25.swp391.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.PlanBenefit;

import java.util.List;

@Repository
public interface PlanBenefitRepository extends JpaRepository<PlanBenefit, Integer> {

    List<PlanBenefit> findBySubscriptionPlanId(Integer planId);

    List<PlanBenefit> findByBenefitTypeAndIsActive(String benefitType, Boolean isActive);
}