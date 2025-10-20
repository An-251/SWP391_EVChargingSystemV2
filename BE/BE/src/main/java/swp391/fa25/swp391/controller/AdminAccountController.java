package swp391.fa25.swp391.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.CreateEmployeeRequest;
import swp391.fa25.swp391.dto.response.AccountResponse;
import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.dto.response.EmployeeResponse;
import swp391.fa25.swp391.entity.Account;
import swp391.fa25.swp391.service.AuthService;
import swp391.fa25.swp391.service.IService.IAccountService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/accounts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminAccountController {

    private final IAccountService accountService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<AccountResponse>> getAllAccounts() {
        List<Account> accounts = accountService.findAll();

        // Map the list of Account entities to your AccountResponse DTO
        List<AccountResponse> accountResponses = accounts.stream()
                .map(this::mapToAccountResponse) // Using a helper method for clarity
                .collect(Collectors.toList());

        return ResponseEntity.ok(accountResponses);
    }

    // Helper method to convert an Account entity to an AccountResponse DTO
    private AccountResponse mapToAccountResponse(Account account) {
        AccountResponse.AccountResponseBuilder builder = AccountResponse.builder()
                .id(account.getId())
                .username(account.getUsername())
                .fullName(account.getFullName())
                .email(account.getEmail())
                .role(account.getAccountRole())
                .phone(account.getPhone())
                .dob(account.getDob())
                .gender(account.getGender())
                .status(account.getStatus())
                .balance(account.getBalance());

        if (account.getDriver() != null) {
            builder.driverId(account.getDriver().getId());
        }
        if (account.getAdmin() != null) {
            builder.adminId(account.getAdmin().getId());
        }

        return builder.build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAccount(@PathVariable Integer id) {
        boolean deleted = accountService.deleteAccountById(id);
        if (deleted) {
            return ResponseEntity.ok("Account with ID " + id + " deleted successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Account not found or could not be deleted.");
        }
    }
    @PostMapping("/employees")
    public ResponseEntity<?> createEmployee(@Valid @RequestBody CreateEmployeeRequest request) {
        try {
            EmployeeResponse response = authService.createStationEmployee(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Employee created successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error creating employee: " + e.getMessage()));
        }
    }
}