package swp391.fa25.swp391.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.LoginRequest;
import swp391.fa25.swp391.dto.request.RegisterRequest;
import swp391.fa25.swp391.dto.request.UpdateProfileRequest;
import swp391.fa25.swp391.dto.response.AccountResponse;
import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.dto.response.LoginResponse;
import swp391.fa25.swp391.dto.response.RegisterResponse;
import swp391.fa25.swp391.entity.Account;
import swp391.fa25.swp391.security.JwtTokenProvider;
import swp391.fa25.swp391.service.IService.IAccountService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174"})
public class AccountController {

    private final JwtTokenProvider jwtTokenProvider;
    private final IAccountService accountService;
    private final PasswordEncoder passwordEncoder;

    public AccountController(JwtTokenProvider jwtTokenProvider, IAccountService accountService, PasswordEncoder passwordEncoder) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.accountService = accountService;
        this.passwordEncoder = passwordEncoder;
    }

    // ==================== AUTHENTICATION ENDPOINTS ====================

    /**
     * Login endpoint
     * POST /api/accounts/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequest loginRequest) {
        try {
            boolean isLoginSuccessful = accountService.login(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
            );

            List<Account> accounts = accountService.findByUsername(loginRequest.getUsername());

            if (isLoginSuccessful && !accounts.isEmpty()) {
                Account account = accounts.getFirst();

                String token = jwtTokenProvider.generateToken(account);

                AccountResponse accountResponse = AccountResponse.builder()
                        .id(account.getId())
                        .username(account.getUsername())
                        .fullName(account.getFullName())
                        .email(account.getEmail())
                        .role(account.getAccountRole())
                        .build();

                LoginResponse loginResponse = new LoginResponse(token, accountResponse);
                return ResponseEntity.ok(ApiResponse.success("Login successful", loginResponse));
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid username or password"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Login error: " + e.getMessage()));
        }
    }

    /**
     * Register endpoint
     * POST /api/accounts/register
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid RegisterRequest registerRequest) {
        try {
            // Check if username already exists
            if (accountService.existsByUsername(registerRequest.getUsername())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Username is already taken"));
            }

            // Check if email already exists
            if (accountService.existsByEmail(registerRequest.getEmail())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Email is already in use"));
            }

            // Create new account
            Account account = new Account();
            account.setUsername(registerRequest.getUsername());
            account.setEmail(registerRequest.getEmail());
            account.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            account.setCreatedDate(Instant.now());
            account.setBalance(0.0);
            account.setAccountRole("Driver");
            account.setStatus("ACTIVE");

            // Save account
            Account savedAccount = accountService.register(account);

            // Generate JWT token
            String jwt = jwtTokenProvider.generateToken(savedAccount);

            // Create response
            RegisterResponse registerResponse = new RegisterResponse(
                    "User registered successfully",
                    savedAccount.getId(),
                    savedAccount.getUsername(),
                    savedAccount.getEmail(),
                    savedAccount.getAccountRole(),
                    jwt
            );

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("User registered successfully", registerResponse));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Registration error: " + e.getMessage()));
        }
    }

    /**
     * Logout endpoint
     * POST /api/accounts/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        try {
            // Clear cookie (if used)
            Cookie cookie = new Cookie("jwt", null);
            cookie.setPath("/");
            cookie.setMaxAge(0);
            cookie.setHttpOnly(true);
            response.addCookie(cookie);

            return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Logout error: " + e.getMessage()));
        }
    }

    // ==================== PROFILE MANAGEMENT (JWT-BASED) ====================

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
            @RequestBody @Valid UpdateProfileRequest updateRequest) {
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

            // Return limited information for public endpoint
            AccountResponse accountResponse = AccountResponse.builder()
                    .id(account.getId())
                    .username(account.getUsername())
                    .fullName(account.getFullName())
                    .role(account.getAccountRole())
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