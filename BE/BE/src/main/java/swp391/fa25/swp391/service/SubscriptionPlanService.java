package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.entity.SubscriptionPlan;
import swp391.fa25.swp391.repository.SubscriptionPlanRepository;
import swp391.fa25.swp391.service.IService.ISubscriptionPlanService;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionPlanService implements ISubscriptionPlanService {

    private final SubscriptionPlanRepository subscriptionPlanRepository;

    @Override
    @Transactional
    public SubscriptionPlan register(SubscriptionPlan subscriptionPlan) {
        // ⭐ Validation: Chỉ có 1 plan được là default cho mỗi targetUserType
        if (Boolean.TRUE.equals(subscriptionPlan.getIsDefault())) {
            subscriptionPlanRepository.findByIsDefaultAndTargetUserType(true, subscriptionPlan.getTargetUserType())
                .ifPresent(existingDefault -> {
                    throw new RuntimeException("Đã có một gói Basic cho " + subscriptionPlan.getTargetUserType() + ". Không thể tạo thêm gói mặc định.");
                });
        }

        log.info("Creating new subscription plan: {} for {}", subscriptionPlan.getPlanName(), subscriptionPlan.getTargetUserType());
        return subscriptionPlanRepository.save(subscriptionPlan);
    }

    @Override
    @Transactional
    public SubscriptionPlan updateSubscriptionPlan(SubscriptionPlan subscriptionPlan) {
        log.info("Updating subscription plan: {}", subscriptionPlan.getId());
        return subscriptionPlanRepository.save(subscriptionPlan);
    }

    @Override
    @Transactional
    public void deleteSubscriptionPlan(Integer id) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        // ⭐ Không cho xóa Basic plan
        if (Boolean.TRUE.equals(plan.getIsDefault())) {
            throw new RuntimeException("Không thể xóa gói Basic (default plan)");
        }

        log.info("Deleting subscription plan: {}", id);
        subscriptionPlanRepository.deleteById(id);
    }

    @Override
    public SubscriptionPlan findById(Integer id) {
        return subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found with ID: " + id));
    }

    @Override
    public List<SubscriptionPlan> findAll() {
        return subscriptionPlanRepository.findAll();
    }

    @Override
    public List<SubscriptionPlan> findSubscriptionPlanName(String subscriptionPlanName) {
        return subscriptionPlanRepository.findByPlanNameContaining(subscriptionPlanName);
    }


    public SubscriptionPlan getBasicPlan() {
        return subscriptionPlanRepository.findByIsDefault(true)
                .orElseThrow(() -> new RuntimeException("Basic plan not found in database"));
    }

    // ⭐ NEW: Get Basic plan cho Driver
    public SubscriptionPlan getBasicPlanForDriver() {
        return subscriptionPlanRepository.findByIsDefaultAndTargetUserType(true, "Driver")
                .orElseThrow(() -> new RuntimeException("Basic plan for Driver not found in database"));
    }

    // ⭐ NOTE: Enterprise KHÔNG có Basic plan miễn phí
    // Enterprise must purchase paid plans only
    // Method kept for potential future use, but will throw exception
    public SubscriptionPlan getBasicPlanForEnterprise() {
        return subscriptionPlanRepository.findByIsDefaultAndTargetUserType(true, "Enterprise")
                .orElseThrow(() -> new RuntimeException("No free Basic plan for Enterprise. Enterprise users must purchase subscription plans."));
    }

    // ⭐ NEW: Get all plans by target user type
    public List<SubscriptionPlan> findByTargetUserType(String targetUserType) {
        return subscriptionPlanRepository.findByTargetUserType(targetUserType);
    }
}