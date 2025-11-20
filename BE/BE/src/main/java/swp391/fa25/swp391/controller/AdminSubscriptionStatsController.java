package swp391.fa25.swp391.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.response.SubscriptionStatsResponse;
import swp391.fa25.swp391.service.AdminSubscriptionStatsService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/admin/subscriptions/stats")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminSubscriptionStatsController {

    private final AdminSubscriptionStatsService statsService;

    /**
     * Lấy danh sách các gói đăng ký được active nhiều nhất
     */
    @GetMapping("/most-active")
    public ResponseEntity<List<SubscriptionStatsResponse>> getMostActiveSubscriptions() {
        log.info("📊 [ADMIN] Fetching most active subscription stats");
        return ResponseEntity.ok(statsService.getMostActiveSubscriptions());
    }

    /**
     * Lấy danh sách các gói bị hủy nhiều nhất
     */
    @GetMapping("/most-cancelled")
    public ResponseEntity<List<SubscriptionStatsResponse>> getMostCancelledSubscriptions() {
        log.info("📊 [ADMIN] Fetching most cancelled subscription stats");
        return ResponseEntity.ok(statsService.getMostCancelledSubscriptions());
    }
}
