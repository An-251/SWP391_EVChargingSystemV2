package swp391.fa25.swp391.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.Cookie;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    /**
     * Login endpoint
     * POST /api/accounts/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest accountRequest) {
        try {
            boolean isLoginSuccessful = accountService.login(accountRequest.getUsername(), accountRequest.getPassword());
            List<Account> accounts = accountService.findByUsername(accountRequest.getUsername());

            if (isLoginSuccessful && !accounts.isEmpty()) {
                Account account = accounts.getFirst();

                String token = jwtTokenProvider.generateToken(account);
                AccountResponse accountResponse = new AccountResponse();
                accountResponse.setId(account.getId());
                accountResponse.setUsername(account.getUsername());
                accountResponse.setFullName(account.getFullName());
                accountResponse.setEmail(account.getEmail());
                accountResponse.setRole(account.getAccountRole());

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
     * Get account by username
     * GET /api/accounts/username/{name}
     */
    @GetMapping("/username/{name}")
    public ResponseEntity<?> getAccountByName(@PathVariable String name) {
        try {
            List<Account> accounts = accountService.findByUsername(name);
            if (!accounts.isEmpty()) {
                Account account = accounts.getFirst();
                AccountResponse accountResponse = new AccountResponse();
                accountResponse.setId(account.getId());
                accountResponse.setUsername(account.getUsername());
                accountResponse.setFullName(account.getFullName());
                accountResponse.setEmail(account.getEmail());
                accountResponse.setRole(account.getAccountRole());

                return ResponseEntity.ok(ApiResponse.success("Account found", accountResponse));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Account not found"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving account: " + e.getMessage()));
        }
    }

    /**
     * Update account profile
     * PUT /api/accounts/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAccount(
            @PathVariable Integer id,
            @RequestBody UpdateProfileRequest updateRequest) {
        try {
            Optional<Account> existingAccountOpt = accountService.findById(id);

            if (existingAccountOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Account not found"));
            }

            Account existingAccount = getAccount(updateRequest, existingAccountOpt);
            Account updatedAccount = accountService.updateAccount(existingAccount);

            // Create response
            AccountResponse accountResponse = new AccountResponse();
            accountResponse.setId(updatedAccount.getId());
            accountResponse.setUsername(updatedAccount.getUsername());
            accountResponse.setFullName(updatedAccount.getFullName());
            accountResponse.setEmail(updatedAccount.getEmail());
            accountResponse.setRole(updatedAccount.getAccountRole());

            return ResponseEntity.ok(ApiResponse.success("Account updated successfully", accountResponse));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error updating account: " + e.getMessage()));
        }
    }

    private static Account getAccount(UpdateProfileRequest updateRequest, Optional<Account> existingAccountOpt) {
        Account existingAccount = existingAccountOpt.get();

        // Update account fields
        if (updateRequest.getFullName() != null) {
            existingAccount.setFullName(updateRequest.getFullName());
        }
        if (updateRequest.getEmail() != null) {
            existingAccount.setEmail(updateRequest.getEmail());
        }
        if (updateRequest.getPhone() != null) {
            existingAccount.setPhone(updateRequest.getPhone());
        }
        if (updateRequest.getGender() != null) {
            existingAccount.setGender(updateRequest.getGender());
        }
        if (updateRequest.getDob() != null) {
            existingAccount.setDob(updateRequest.getDob());
        }
        return existingAccount;
    }

    /**
     * Delete account
     * DELETE /api/accounts/{name}
     */
    @DeleteMapping("/{name}")
    public ResponseEntity<?> deleteAccount(@PathVariable String name) {
        try {
            boolean deleted = accountService.deleteAccount(name);
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

    /**
     * Logout endpoint
     * POST /api/accounts/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        try {
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }

            Cookie cookie = new Cookie("username", null);
            cookie.setPath("/");
            cookie.setMaxAge(0);
            response.addCookie(cookie);

            return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Logout error: " + e.getMessage()));
        }
    }

    /**
     * Dashboard endpoint
     * GET /api/accounts/dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard(HttpServletRequest request) {
        try {
            HttpSession session = request.getSession(false);
            if (session != null && session.getAttribute("username") != null) {
                String welcomeMessage = "Welcome " + session.getAttribute("username");
                return ResponseEntity.ok(ApiResponse.success(welcomeMessage));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Please login first"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Dashboard error: " + e.getMessage()));
        }
    }
}