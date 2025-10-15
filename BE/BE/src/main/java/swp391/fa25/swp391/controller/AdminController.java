package swp391.fa25.swp391.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.entity.Account;
import swp391.fa25.swp391.service.IService.IAccountService;
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
    private final ISubscriptionPlanService subscriptionPlanService;

    @GetMapping("/dashboard")
    public ResponseEntity<String> getDashboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

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
    public ResponseEntity<List<Account>> getAllAccounts() {
        List<Account> accounts = accountService.findAll();
        return ResponseEntity.ok(accounts);
    }

    @DeleteMapping("/accounts/{id}")
    public ResponseEntity<String> deleteAccount(@PathVariable Integer id) {
        boolean deleted = accountService.deleteAccountById(id);
        if (deleted) {
            return ResponseEntity.ok("Account with ID " + id + " deleted successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Account not found or could not be deleted.");
        }
    }

    @PutMapping("/accounts/{id}")
    public ResponseEntity<?> updateAccount(@PathVariable Integer id, @RequestBody Account updatedAccount) {
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

}