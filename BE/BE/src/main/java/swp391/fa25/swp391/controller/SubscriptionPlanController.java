package swp391.fa25.swp391.controller;

import jakarta.validation.Valid; // Import cho @Valid
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.SubscriptionPlanRequest; // Import Request DTO
import swp391.fa25.swp391.dto.response.SubscriptionPlanResponse; // Import Response DTO
import swp391.fa25.swp391.entity.SubscriptionPlan;
import swp391.fa25.swp391.service.IService.ISubscriptionPlanService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SubscriptionPlanController {

    private final ISubscriptionPlanService subscriptionPlanService;

    // ==================== HELPER CONVERTER METHODS ====================

    /**
     * Chuyển đổi từ Entity sang Response DTO.
     */
    private SubscriptionPlanResponse convertToDto(SubscriptionPlan plan) {
        return SubscriptionPlanResponse.builder()
                .id(plan.getId())
                .planName(plan.getPlanName())
                .planType(plan.getPlanType())
                .targetUserType(plan.getTargetUserType()) // ⭐ THÊM
                .price(plan.getPrice())
                .validityDays(plan.getValidityDays())
                .description(plan.getDescription())
                .isDefault(plan.getIsDefault()) // ⭐ THÊM
                .discountRate(plan.getDiscountRate()) // ⭐ THÊM
                .totalRegistrations(plan.getPlanRegistrations() != null ? plan.getPlanRegistrations().size() : 0)
                .build();
    }

    /**
     * Chuyển đổi từ Request DTO sang Entity (khi tạo mới).
     */
    private SubscriptionPlan convertToEntity(SubscriptionPlanRequest request) {
        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setPlanName(request.getPlanName());
        plan.setPlanType(request.getPlanType());
        plan.setTargetUserType(request.getTargetUserType()); // ⭐ THÊM
        plan.setPrice(request.getPrice());
        plan.setValidityDays(request.getValidityDays());
        plan.setDescription(request.getDescription());
        plan.setDiscountRate(request.getDiscountRate());
        plan.setIsDefault(request.getIsDefault());
        return plan;
    }

    /**
     * Cập nhật Entity đã tồn tại từ Request DTO.
     */
    private void updateEntityFromRequest(SubscriptionPlan plan, SubscriptionPlanRequest request) {
        plan.setPlanName(request.getPlanName());
        plan.setPlanType(request.getPlanType());
        plan.setTargetUserType(request.getTargetUserType()); // ⭐ THÊM
        plan.setPrice(request.getPrice());
        plan.setValidityDays(request.getValidityDays());
        plan.setDescription(request.getDescription());
        plan.setDiscountRate(request.getDiscountRate());
        plan.setIsDefault(request.getIsDefault());
    }

    // ==================== CONTROLLER ENDPOINTS ====================

    @PostMapping("/profile")
    public ResponseEntity<?> createSubscriptionPlan(@Valid @RequestBody SubscriptionPlanRequest request) {
        try {
            SubscriptionPlan newPlan = convertToEntity(request);
            SubscriptionPlan savedPlan = subscriptionPlanService.register(newPlan);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(savedPlan));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error creating subscription plan: " + e.getMessage());
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<List<SubscriptionPlanResponse>> getAllSubscriptionPlans() {
        List<SubscriptionPlan> subscriptions = subscriptionPlanService.findAll();
        List<SubscriptionPlanResponse> responseList = subscriptions.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchSubscriptionByName(@RequestParam String name) {
        List<SubscriptionPlan> subscriptions = subscriptionPlanService.findSubscriptionPlanName(name);
        if (subscriptions.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No subscription plans found with name: " + name);
        }
        List<SubscriptionPlanResponse> responseList = subscriptions.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSubscriptionPlanById(@PathVariable Integer id) {
        try {
            SubscriptionPlan subscription = subscriptionPlanService.findById(id);
            return ResponseEntity.ok(convertToDto(subscription));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Subscription plan not found with ID: " + id);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSubscriptionPlan(@PathVariable Integer id,
                                                    @Valid @RequestBody SubscriptionPlanRequest request) {
        try {
            SubscriptionPlan existingPlan = subscriptionPlanService.findById(id);
            updateEntityFromRequest(existingPlan, request);
            SubscriptionPlan savedPlan = subscriptionPlanService.updateSubscriptionPlan(existingPlan);
            return ResponseEntity.ok(convertToDto(savedPlan));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Subscription plan not found.");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSubscriptionPlan(@PathVariable Integer id) {
        try {
            subscriptionPlanService.deleteSubscriptionPlan(id);
            return ResponseEntity.ok("Subscription plan with ID " + id + " deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Subscription plan not found or could not be deleted.");
        }
    }

    /**
     * ⭐ NEW: Get plans by target user type (Driver or Enterprise)
     * GET /api/subscriptions/for/{userType}
     * Example: /api/subscriptions/for/Driver
     */
    @GetMapping("/for/{userType}")
    public ResponseEntity<?> getSubscriptionsByUserType(@PathVariable String userType) {
        try {
            List<SubscriptionPlan> plans = subscriptionPlanService.findByTargetUserType(userType);
            if (plans.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No subscription plans found for user type: " + userType);
            }
            List<SubscriptionPlanResponse> responseList = plans.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responseList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error fetching plans for user type: " + e.getMessage());
        }
    }
}