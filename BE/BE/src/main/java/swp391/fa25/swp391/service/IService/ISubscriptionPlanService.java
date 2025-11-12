package swp391.fa25.swp391.service.IService;

import swp391.fa25.swp391.entity.SubscriptionPlan;

import java.util.List;
import java.util.Optional;

public interface ISubscriptionPlanService {
    SubscriptionPlan register(SubscriptionPlan subscriptionPlan);
    void deleteSubscriptionPlan(Integer id);
    SubscriptionPlan updateSubscriptionPlan(SubscriptionPlan subscriptionPlan);
    SubscriptionPlan findById(Integer id);
    List<SubscriptionPlan> findSubscriptionPlanName(String subscriptionPlanName);
    List<SubscriptionPlan> findAll();
    
    // ⭐ NEW: Find plans by target user type (Driver or Enterprise)
    List<SubscriptionPlan> findByTargetUserType(String targetUserType);
}
