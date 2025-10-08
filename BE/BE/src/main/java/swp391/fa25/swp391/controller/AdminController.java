package swp391.fa25.swp391.controller;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import swp391.fa25.swp391.repository.models.SubscriptionPlanRepository;
import swp391.fa25.swp391.service.IService.IAccountService;
import swp391.fa25.swp391.service.IService.IChargingStationService;
import swp391.fa25.swp391.service.IService.IFacilityService;

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
        long subscriptionCount = subscriptionRepository.findAll().size();

        String dashboardInfo = String.format(
                "Hello %s! Accounts: %d, Stations: %d, Facilities: %d, Subscriptions: %d",
                username, accountCount, stationCount, facilityCount, subscriptionCount
        );

        return ResponseEntity.ok(dashboardInfo);
    }
}

