package swp391.fa25.swp391.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.entity.Account;
import swp391.fa25.swp391.entity.ChargingPoint;
import swp391.fa25.swp391.entity.ChargingStation;
import swp391.fa25.swp391.entity.Facility;
import swp391.fa25.swp391.entity.SubscriptionPlan;
import swp391.fa25.swp391.service.IService.IAccountService;
import swp391.fa25.swp391.service.IService.IChargingPointService;
import swp391.fa25.swp391.service.IService.IChargingStationService;
import swp391.fa25.swp391.service.IService.IFacilityService;
import swp391.fa25.swp391.service.IService.ISubscriptionPlanService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final IAccountService accountService;
    private final IChargingStationService chargingStationService;
    private final IFacilityService facilityService;
    private final IChargingPointService chargingPointService;
    private final ISubscriptionPlanService subscriptionPlanService;

    @GetMapping("/dashboard")
    public ResponseEntity<String> getDashboard(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("username") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login first");
        }

        String username = (String) session.getAttribute("username");

        long accountCount = accountService.findAll().size();
        long stationCount = chargingStationService.findAll().size();
        long facilityCount = facilityService.findAll().size();
        long subscriptionCount = subscriptionPlanService.findAll().size();

        String dashboardInfo = String.format(
                "Hello %s! Accounts: %d, Stations: %d, Facilities: %d, Subscriptions: %d",
                username, accountCount, stationCount, facilityCount, subscriptionCount
        );

        return ResponseEntity.ok(dashboardInfo);
    }

    // ==================== ACCOUNT MANAGEMENT ====================

    @GetMapping("/accounts")
    public ResponseEntity<List<Account>> getAllAccounts(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("username") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<Account> accounts = accountService.findAll();
        return ResponseEntity.ok(accounts);
    }

    @DeleteMapping("/accounts/{id}")
    public ResponseEntity<String> deleteAccount(@PathVariable Integer id, HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("username") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login");
        }

        boolean deleted = accountService.deleteAccountById(id);
        if (deleted) {
            return ResponseEntity.ok("Account with ID " + id + " deleted successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Account not found or could not be deleted.");
        }
    }

    @PutMapping("/accounts/{id}")
    public ResponseEntity<?> updateAccount(@PathVariable Integer id, @RequestBody Account updatedAccount, HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("username") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login");
        }

        Optional<Account> existingAccountOpt = accountService.findById(id);
        if (existingAccountOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Account not found.");
        }

        Account existingAccount = existingAccountOpt.get();
        existingAccount.setEmail(updatedAccount.getEmail());
        existingAccount.setUsername(updatedAccount.getUsername());
        existingAccount.setPhone(updatedAccount.getPhone());
        existingAccount.setAccountRole(updatedAccount.getAccountRole());

        Account savedAccount = accountService.updateAccount(existingAccount);
        return ResponseEntity.ok(savedAccount);
    }

    // ==================== STATION MANAGEMENT ====================

    @GetMapping("/stations")
    public ResponseEntity<List<ChargingStation>> getAllStations(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("username") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<ChargingStation> stations = chargingStationService.findAll();
        return ResponseEntity.ok(stations);
    }

    @GetMapping("/facilities")
    public ResponseEntity<List<Facility>> getAllFacilities(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("username") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Facility> facilities = facilityService.findAll();
        return ResponseEntity.ok(facilities);
    }

    // ==================== CHARGING POINT MANAGEMENT ====================

    @PostMapping("/charging-points")
    public ResponseEntity<?> createChargingPoint(@RequestBody ChargingPoint chargingPoint, HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("username") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login");
        }

        try {
            ChargingPoint savedPoint = chargingPointService.save(chargingPoint);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedPoint);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error creating charging point: " + e.getMessage());
        }
    }

    @GetMapping("/charging-points")
    public ResponseEntity<List<ChargingPoint>> getAllChargingPoints(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("username") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<ChargingPoint> chargingPoints = chargingPointService.findAll();
        return ResponseEntity.ok(chargingPoints);
    }

    @GetMapping("/charging-points/{id}")
    public ResponseEntity<?> getChargingPointById(@PathVariable Integer id, HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("username") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login");
        }

        Optional<ChargingPoint> chargingPoint = chargingPointService.findById(id);
        if (chargingPoint.isPresent()) {
            return ResponseEntity.ok(chargingPoint.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Charging point not found with ID: " + id);
        }
    }

    @DeleteMapping("/charging-points/{id}")
    public ResponseEntity<String> deleteChargingPoint(@PathVariable Integer id, HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("username") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login");
        }

        try {
            chargingPointService.deleteChargingPoint(id);
            return ResponseEntity.ok("Charging point with ID " + id + " deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Charging point not found or could not be deleted.");
        }
    }

    @PutMapping("/charging-points/{id}")
    public ResponseEntity<?> updateChargingPoint(@PathVariable Integer id, @RequestBody ChargingPoint updatedPoint, HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("username") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login");
        }

        Optional<ChargingPoint> existingPointOpt = chargingPointService.findById(id);
        if (existingPointOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Charging point not found.");
        }

        updatedPoint.setId(id);
        ChargingPoint savedPoint = chargingPointService.updateChargingPoint(updatedPoint);
        return ResponseEntity.ok(savedPoint);
    }

    // ==================== SUBSCRIPTION PLAN MANAGEMENT ====================

    @PostMapping("/subscriptions")
    public ResponseEntity<?> createSubscriptionPlan(@RequestBody SubscriptionPlan subscriptionPlan, HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("username") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login");
        }

        try {
            SubscriptionPlan savedPlan = subscriptionPlanService.register(subscriptionPlan);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedPlan);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error creating subscription plan: " + e.getMessage());
        }
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<List<SubscriptionPlan>> getAllSubscriptionPlans(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("username") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<SubscriptionPlan> subscriptions = subscriptionPlanService.findAll();
        return ResponseEntity.ok(subscriptions);
    }

    @GetMapping("/subscriptions/search")
    public ResponseEntity<?> searchSubscriptionByName(@RequestParam String name, HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("username") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login");
        }

        List<SubscriptionPlan> subscriptions = subscriptionPlanService.findSubscriptionPlanName(name);
        if (subscriptions.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No subscription plans found with name: " + name);
        }
        return ResponseEntity.ok(subscriptions);
    }

    @GetMapping("/subscriptions/{id}")
    public ResponseEntity<?> getSubscriptionPlanById(@PathVariable Integer id, HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("username") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login");
        }

        try {
            SubscriptionPlan subscription = subscriptionPlanService.findById(id);
            return ResponseEntity.ok(subscription);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Subscription plan not found with ID: " + id);
        }
    }

    @DeleteMapping("/subscriptions/{id}")
    public ResponseEntity<String> deleteSubscriptionPlan(@PathVariable Integer id, HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("username") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login");
        }

        try {
            subscriptionPlanService.deleteSubscriptionPlan(id);
            return ResponseEntity.ok("Subscription plan with ID " + id + " deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Subscription plan not found or could not be deleted.");
        }
    }

    @PutMapping("/subscriptions/{id}")
    public ResponseEntity<?> updateSubscriptionPlan(@PathVariable Integer id, @RequestBody SubscriptionPlan updatedPlan, HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("username") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login");
        }

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