package swp391.fa25.swp391.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.entity.CashPaymentRequest;
import swp391.fa25.swp391.entity.PlanRegistration;
import swp391.fa25.swp391.entity.SubscriptionPlan;
import swp391.fa25.swp391.repository.SubscriptionPlanRepository;
import swp391.fa25.swp391.service.CashPaymentRequestService;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SubscriptionPurchaseController {

    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final CashPaymentRequestService cashPaymentRequestService;

    /**
     * Get all available subscription plans
     * GET /api/subscriptions/plans
     */
    @GetMapping("/plans")
    public ResponseEntity<ApiResponse> getAllPlans() {
        try {
            List<SubscriptionPlan> plans = subscriptionPlanRepository.findAll();
            return ResponseEntity.ok()
                    .body(ApiResponse.success("Subscription plans retrieved successfully", plans));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving subscription plans: " + e.getMessage()));
        }
    }

    /**
     * Get plans by target user type
     * GET /api/subscriptions/plans/type/{userType}
     */
    @GetMapping("/plans/type/{userType}")
    public ResponseEntity<ApiResponse> getPlansByUserType(@PathVariable String userType) {
        try {
            List<SubscriptionPlan> plans = subscriptionPlanRepository.findByTargetUserType(userType);
            return ResponseEntity.ok()
                    .body(ApiResponse.success("Subscription plans retrieved successfully", plans));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving subscription plans: " + e.getMessage()));
        }
    }

    /**
     * Request cash payment for subscription purchase
     * POST /api/subscriptions/purchase/cash
     */
    @PostMapping("/purchase/cash")
    public ResponseEntity<ApiResponse> purchaseWithCash(
            @RequestParam Integer driverId,
            @RequestParam Integer subscriptionPlanId,
            @RequestParam Integer facilityId) {
        try {
            CashPaymentRequest request = cashPaymentRequestService.createSubscriptionPaymentRequest(
                    driverId,
                    subscriptionPlanId,
                    facilityId,
                    null // Amount will be taken from subscription plan price
            );

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(
                            "Cash payment request created successfully. Please visit the facility to complete payment.",
                            request
                    ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Error creating cash payment request: " + e.getMessage()));
        }
    }

    /**
     * Get subscription plan details by ID
     * GET /api/subscriptions/plans/{id}
     */
    @GetMapping("/plans/{id}")
    public ResponseEntity<ApiResponse> getPlanById(@PathVariable Integer id) {
        try {
            SubscriptionPlan plan = subscriptionPlanRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Subscription plan not found"));
            
            return ResponseEntity.ok()
                    .body(ApiResponse.success("Subscription plan retrieved successfully", plan));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Subscription plan not found: " + e.getMessage()));
        }
    }
}
