package swp391.fa25.swp391.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.entity.SubscriptionPlan;
import swp391.fa25.swp391.service.IService.ISubscriptionPlanService;

import java.util.List;
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")

public class SubscriptionController {

    public final ISubscriptionPlanService subscriptionPlanService;

    @PostMapping("/subscriptions")
    public ResponseEntity<?> createSubscriptionPlan(@RequestBody SubscriptionPlan subscriptionPlan) {
        try {
            SubscriptionPlan savedPlan = subscriptionPlanService.register(subscriptionPlan);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedPlan);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error creating subscription plan: " + e.getMessage());
        }
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<List<SubscriptionPlan>> getAllSubscriptionPlans() {
        List<SubscriptionPlan> subscriptions = subscriptionPlanService.findAll();
        return ResponseEntity.ok(subscriptions);
    }

    @GetMapping("/subscriptions/search")
    public ResponseEntity<?> searchSubscriptionByName(@RequestParam String name) {
        List<SubscriptionPlan> subscriptions = subscriptionPlanService.findSubscriptionPlanName(name);
        if (subscriptions.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No subscription plans found with name: " + name);
        }
        return ResponseEntity.ok(subscriptions);
    }

    @GetMapping("/subscriptions/{id}")
    public ResponseEntity<?> getSubscriptionPlanById(@PathVariable Integer id) {
        try {
            SubscriptionPlan subscription = subscriptionPlanService.findById(id);
            return ResponseEntity.ok(subscription);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Subscription plan not found with ID: " + id);
        }
    }

    @DeleteMapping("/subscriptions/{id}")
    public ResponseEntity<String> deleteSubscriptionPlan(@PathVariable Integer id) {
        try {
            subscriptionPlanService.deleteSubscriptionPlan(id);
            return ResponseEntity.ok("Subscription plan with ID " + id + " deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Subscription plan not found or could not be deleted.");
        }
    }

    @PutMapping("/subscriptions/{id}")
    public ResponseEntity<?> updateSubscriptionPlan(@PathVariable Integer id, @RequestBody SubscriptionPlan updatedPlan) {
        try {
            SubscriptionPlan existingPlan = subscriptionPlanService.findById(id);
            updatedPlan.setId(id);
            SubscriptionPlan savedPlan = subscriptionPlanService.updateSubscriptionPlan(updatedPlan);
            return ResponseEntity.ok(savedPlan);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Subscription plan not found.");
        }
    }
}
