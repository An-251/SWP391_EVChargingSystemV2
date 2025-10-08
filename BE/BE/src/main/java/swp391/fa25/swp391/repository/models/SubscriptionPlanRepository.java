package swp391.fa25.swp391.repository.models;

import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.SubscriptionPlan;
import swp391.fa25.swp391.repository.GenericRepositoryImpl;

@Repository
public class SubscriptionPlanRepository extends GenericRepositoryImpl<SubscriptionPlan> {
    public SubscriptionPlanRepository() {
        super(SubscriptionPlan.class);
    }
}
