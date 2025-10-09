package swp391.fa25.swp391.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.entity.Account;
import swp391.fa25.swp391.entity.ChargingStation;
import swp391.fa25.swp391.entity.Facility;
import swp391.fa25.swp391.repository.models.SubscriptionPlanRepository;
import swp391.fa25.swp391.service.IService.IAccountService;
import swp391.fa25.swp391.service.IService.IChargingStationService;
import swp391.fa25.swp391.service.IService.IFacilityService;

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
    private final SubscriptionPlanRepository subscriptionRepository;

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
//        long subscriptionCount = subscriptionRepository.findAll().size();

        String dashboardInfo = String.format(
                "Hello %s! Accounts: %d, Stations: %d, Facilities: %d",
                username, accountCount, stationCount, facilityCount
        );

        return ResponseEntity.ok(dashboardInfo);
    }

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
}
