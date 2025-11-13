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

        List<AccountResponse> accountResponses = accounts.stream()
                .map(this::buildFullAccountResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(accountResponses);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAccount(@PathVariable Integer id) {
        boolean deleted = accountService.deleteAccountById(id);
        if (deleted) {
            return ResponseEntity.ok("Account with ID " + id + " deleted successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Account not found or could not be deleted.");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateAccount(@PathVariable Integer id, @RequestBody Account accountUpdate) {
        try {
            // findById returns Optional<Account>, need to unwrap it
            Account existingAccount = accountService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Account not found"));

            // Update only allowed fields
            if (accountUpdate.getFullName() != null) {
                existingAccount.setFullName(accountUpdate.getFullName());
            }
            if (accountUpdate.getEmail() != null) {
                existingAccount.setEmail(accountUpdate.getEmail());
            }
            if (accountUpdate.getPhone() != null) {
                existingAccount.setPhone(accountUpdate.getPhone());
            }
            if (accountUpdate.getDob() != null) {
                existingAccount.setDob(accountUpdate.getDob());
            }
            if (accountUpdate.getGender() != null) {
                existingAccount.setGender(accountUpdate.getGender());
            }
            if (accountUpdate.getStatus() != null) {
                // Convert status to lowercase for consistency
                existingAccount.setStatus(accountUpdate.getStatus().toLowerCase());
            }

            Account updatedAccount = accountService.save(existingAccount);
            AccountResponse response = buildFullAccountResponse(updatedAccount);

            return ResponseEntity.ok(ApiResponse.success("Account updated successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error updating account: " + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse> toggleAccountStatus(@PathVariable Integer id) {
        try {
            Account account = accountService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Account not found"));

            // Toggle status: active <-> locked (lowercase)
            String newStatus = "active".equalsIgnoreCase(account.getStatus()) ? "locked" : "active";
            account.setStatus(newStatus);

            Account updatedAccount = accountService.save(account);
            AccountResponse response = buildFullAccountResponse(updatedAccount);

            return ResponseEntity.ok(ApiResponse.success("Account status updated", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error toggling account status: " + e.getMessage()));
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

    // ==================== HELPER METHODS ====================

    /**
     * Build full AccountResponse with all fields for admin view
     */
    private AccountResponse buildFullAccountResponse(Account account) {
        AccountResponse.AccountResponseBuilder builder = AccountResponse.builder()
                .id(account.getId())
                .username(account.getUsername())
                .fullName(account.getFullName())
                .email(account.getEmail())
                .role(account.getAccountRole())
                .phone(account.getPhone())
                .dob(account.getDob())
                .gender(account.getGender())
                .status(account.getStatus());


        // Add driver ID if account is a driver
        if (account.getDriver() != null) {
            builder.driverId(account.getDriver().getId());
        }

        // Add admin ID if account is an admin
        if (account.getAdmin() != null) {
            builder.adminId(account.getAdmin().getId());
        }

        return builder.build();
    }

    /**
     * Build AccountResponse with basic fields only (if needed for other endpoints)
     */
    private AccountResponse buildBasicAccountResponse(Account account) {
        return AccountResponse.builder()
                .id(account.getId())
                .username(account.getUsername())
                .fullName(account.getFullName())
                .role(account.getAccountRole())
                .status(account.getStatus())
                .build();
    }
}