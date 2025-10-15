package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import swp391.fa25.swp391.entity.Facility;
import swp391.fa25.swp391.entity.SubscriptionPlan;
import swp391.fa25.swp391.repository.models.SubscriptionPlanRepository;
import swp391.fa25.swp391.service.IService.ISubscriptionPlanService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionPlanService implements ISubscriptionPlanService {
    private final SubscriptionPlanRepository subscriptionPlanRepository;

    @Override
    public SubscriptionPlan register(SubscriptionPlan subscriptionPlan) {
        return subscriptionPlanRepository.save(subscriptionPlan);
    }

    @Override
    public SubscriptionPlan updateSubscriptionPlan(SubscriptionPlan subscriptionPlan) {
        return subscriptionPlanRepository.save(subscriptionPlan);
    }

    @Override
    public void deleteSubscriptionPlan(Integer id) {
        subscriptionPlanRepository.deleteById(id);
    }

    @Override
    public SubscriptionPlan findById(Integer id) {
        return subscriptionPlanRepository.findById(id).get();
    }


    @Override
    public List<SubscriptionPlan> findAll() {
        return List.of();
    }


    @Override
    public List<SubscriptionPlan> findSubscriptionPlanName(String subscriptionPlanName) {
        return subscriptionPlanRepository.findByPlanNameContaining(subscriptionPlanName);
    }
}
