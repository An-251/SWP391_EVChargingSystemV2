package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.dto.response.SubscriptionStatsResponse;
import swp391.fa25.swp391.repository.PlanRegistrationRepository;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminSubscriptionStatsService {

    private final PlanRegistrationRepository registrationRepository;

    /**
     * Thống kê các gói được active nhiều nhất
     * Query: Đếm số lượng registrations có status = 'active' theo từng plan
     */
    @Transactional(readOnly = true)
    public List<SubscriptionStatsResponse> getMostActiveSubscriptions() {
        log.info("📊 Calculating most active subscriptions...");

        List<Object[]> results = registrationRepository.countByPlanAndStatus("active");
        
        long totalActive = results.stream()
                .mapToLong(r -> (Long) r[2])
                .sum();

        List<SubscriptionStatsResponse> stats = results.stream()
                .map(row -> {
                    Integer planId = (Integer) row[0];
                    String planName = (String) row[1];
                    Long count = (Long) row[2];
                    Double percentage = totalActive > 0 ? (count * 100.0 / totalActive) : 0.0;

                    return SubscriptionStatsResponse.builder()
                            .planId(planId)
                            .planName(planName)
                            .count(count)
                            .percentage(Math.round(percentage * 100.0) / 100.0) // Round to 2 decimals
                            .build();
                })
                .collect(Collectors.toList());

        log.info("✅ Found {} active subscription stats (Total active: {})", stats.size(), totalActive);
        return stats;
    }

    /**
     * Thống kê các gói bị hủy nhiều nhất
     * Query: Đếm số lượng registrations có status = 'cancelled' theo từng plan
     */
    @Transactional(readOnly = true)
    public List<SubscriptionStatsResponse> getMostCancelledSubscriptions() {
        log.info("📊 Calculating most cancelled subscriptions...");

        List<Object[]> results = registrationRepository.countByPlanAndStatus("cancelled");
        
        long totalCancelled = results.stream()
                .mapToLong(r -> (Long) r[2])
                .sum();

        List<SubscriptionStatsResponse> stats = results.stream()
                .map(row -> {
                    Integer planId = (Integer) row[0];
                    String planName = (String) row[1];
                    Long count = (Long) row[2];
                    Double percentage = totalCancelled > 0 ? (count * 100.0 / totalCancelled) : 0.0;

                    return SubscriptionStatsResponse.builder()
                            .planId(planId)
                            .planName(planName)
                            .count(count)
                            .percentage(Math.round(percentage * 100.0) / 100.0)
                            .build();
                })
                .collect(Collectors.toList());

        log.info("✅ Found {} cancelled subscription stats (Total cancelled: {})", stats.size(), totalCancelled);
        return stats;
    }
}
