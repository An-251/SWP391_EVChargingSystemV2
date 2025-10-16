package swp391.fa25.swp391.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.UpdateProfileRequest;
import swp391.fa25.swp391.dto.response.AccountResponse;
import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.entity.Account;
import swp391.fa25.swp391.entity.Driver; // Import Driver
import swp391.fa25.swp391.service.IService.IAccountService;
import swp391.fa25.swp391.service.IService.IDriverService; // Import IDriverService

import java.util.List;
import java.util.Optional;

/**
 * Controller xử lý Account management: Profile, Update, Delete
 */
@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174"})
public class AccountController {

    private final IAccountService accountService;
    private final IDriverService driverService; // Inject IDriverService

    // ==================== PROFILE MANAGEMENT ====================

    /**
     * Get current user's profile
     * GET /api/accounts/profile
     * Requires JWT token in Authorization header
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getCurrentUserProfile(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Authentication required"));
            }

            String username = userDetails.getUsername();
            List<Account> accounts = accountService.findByUsername(username);

            if (accounts.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Account not found"));
            }

            Account account = accounts.getFirst();

            // Lấy DriverId
            Integer driverId = null;
            if ("Driver".equalsIgnoreCase(account.getAccountRole())) {
                Optional<Driver> driverOpt = driverService.findByUsername(account.getUsername());
                driverId = driverOpt.map(Driver::getId).orElse(null);
            }

            AccountResponse accountResponse = AccountResponse.builder()
                    .id(account.getId())
                    .username(account.getUsername())
                    .fullName(account.getFullName())
                    .email(account.getEmail())
                    .phone(account.getPhone())
                    .gender(account.getGender())
                    .dob(account.getDob())
                    .role(account.getAccountRole())
                    .balance(account.getBalance())
                    .status(account.getStatus())
                    .driverId(driverId) // Thêm driverId vào AccountResponse
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", accountResponse));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving profile: " + e.getMessage()));
        }
    }

    /**
     * Update current user's profile
     * PUT /api/accounts/profile
     * Requires JWT token in Authorization header
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateCurrentUserProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest updateRequest) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Authentication required"));
            }

            String username = userDetails.getUsername();
            List<Account> accounts = accountService.findByUsername(username);

            if (accounts.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Account not found"));
            }

            Account existingAccount = accounts.getFirst();

            // Check if email is being changed and if it's already in use by another account
            if (updateRequest.getEmail() != null &&
                    !updateRequest.getEmail().equals(existingAccount.getEmail())) {
                if (accountService.existsByEmail(updateRequest.getEmail())) {
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("Email is already in use"));
                }
            }

            // Update account fields
            updateAccountFields(existingAccount, updateRequest);

            Account updatedAccount = accountService.updateAccount(existingAccount);

            // Lấy DriverId (Giữ nguyên logic Profile hiện tại)
            Integer driverId = null;
            if ("Driver".equalsIgnoreCase(updatedAccount.getAccountRole())) {
                Optional<Driver> driverOpt = driverService.findByUsername(updatedAccount.getUsername());
                driverId = driverOpt.map(Driver::getId).orElse(null);
            }


            // Create response
            AccountResponse accountResponse = AccountResponse.builder()
                    .id(updatedAccount.getId())
                    .username(updatedAccount.getUsername())
                    .fullName(updatedAccount.getFullName())
                    .email(updatedAccount.getEmail())
                    .phone(updatedAccount.getPhone())
                    .gender(updatedAccount.getGender())
                    .dob(updatedAccount.getDob())
                    .role(updatedAccount.getAccountRole())
                    .driverId(driverId) // Thêm driverId vào AccountResponse
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", accountResponse));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error updating profile: " + e.getMessage()));
        }
    }

    /**
     * Delete current user's account
     * DELETE /api/accounts/profile
     * Requires JWT token in Authorization header
     */
    @DeleteMapping("/profile")
    public ResponseEntity<?> deleteCurrentUserAccount(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Authentication required"));
            }

            String username = userDetails.getUsername();
            // Lưu ý: Việc xóa Account có thể không tự động xóa Driver liên quan (tùy thuộc vào cấu hình Cascade/Orphan Removal).
            // Cần đảm bảo rằng Driver liên quan cũng được xử lý (xóa hoặc đặt trạng thái không hoạt động).

            boolean deleted = accountService.deleteAccount(username);

            if (deleted) {
                return ResponseEntity.ok(ApiResponse.success("Account deleted successfully"));
            }

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Account not found"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error deleting account: " + e.getMessage()));
        }
    }

    // ==================== PUBLIC ENDPOINTS ====================

    /**
     * Get account by username (public endpoint for looking up users)
     * GET /api/accounts/username/{username}
     */
    @GetMapping("/username/{username}")
    public ResponseEntity<?> getAccountByUsername(@PathVariable String username) {
        try {
            List<Account> accounts = accountService.findByUsername(username);

            if (accounts.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Account not found"));
            }

            Account account = accounts.getFirst();

            // Lấy DriverId
            Integer driverId = null;
            if ("Driver".equalsIgnoreCase(account.getAccountRole())) {
                Optional<Driver> driverOpt = driverService.findByUsername(account.getUsername());
                driverId = driverOpt.map(Driver::getId).orElse(null);
            }


            // Return limited information for public endpoint
            AccountResponse accountResponse = AccountResponse.builder()
                    .id(account.getId())
                    .username(account.getUsername())
                    .fullName(account.getFullName())
                    .role(account.getAccountRole())
                    .driverId(driverId) // Thêm driverId vào AccountResponse
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Account found", accountResponse));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving account: " + e.getMessage()));
        }
    }

    // ==================== HELPER METHODS ====================

    /**
     * Helper method to update account fields from request
     */
    private void updateAccountFields(Account account, UpdateProfileRequest updateRequest) {
        if (updateRequest.getFullName() != null) {
            account.setFullName(updateRequest.getFullName());
        }
        if (updateRequest.getEmail() != null) {
            account.setEmail(updateRequest.getEmail());
        }
        if (updateRequest.getPhone() != null) {
            account.setPhone(updateRequest.getPhone());
        }
        if (updateRequest.getGender() != null) {
            account.setGender(updateRequest.getGender());
        }
        if (updateRequest.getDob() != null) {
            account.setDob(updateRequest.getDob());
        }
    }
}