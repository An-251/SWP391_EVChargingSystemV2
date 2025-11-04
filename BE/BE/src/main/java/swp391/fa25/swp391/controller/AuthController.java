package swp391.fa25.swp391.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.*;
import swp391.fa25.swp391.dto.response.AccountResponse;
import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.dto.response.LoginResponse;
import swp391.fa25.swp391.dto.response.RegisterResponse;
import swp391.fa25.swp391.entity.Account;
import swp391.fa25.swp391.entity.Driver;
import swp391.fa25.swp391.security.JwtTokenProvider;
import swp391.fa25.swp391.service.AuthService;
import swp391.fa25.swp391.service.IService.IAccountService;
import swp391.fa25.swp391.service.IService.IDriverService;
import swp391.fa25.swp391.service.PasswordResetService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174"})
public class AuthController {

    private final JwtTokenProvider jwtTokenProvider;
    private final IAccountService accountService;
    private final IDriverService driverService;
    private final AuthService authService; // ✅ Inject AuthService mới

    /**
     * Login endpoint
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            boolean isLoginSuccessful = accountService.login(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
            );

            List<Account> accounts = accountService.findByUsername(loginRequest.getUsername());

            if (isLoginSuccessful && !accounts.isEmpty()) {
                Account account = accounts.get(0);

                // Lấy DriverId
                Integer driverId = null;
                if ("Driver".equalsIgnoreCase(account.getAccountRole())) {
                    Optional<Driver> driverOpt = driverService.findByUsername(account.getUsername());
                    driverId = driverOpt.map(Driver::getId).orElse(null);
                }

                String token = jwtTokenProvider.generateToken(account);

                AccountResponse accountResponse = new AccountResponse();
                accountResponse.setId(account.getId());
                accountResponse.setUsername(account.getUsername());
                accountResponse.setFullName(account.getFullName());
                accountResponse.setEmail(account.getEmail());
                accountResponse.setRole(account.getAccountRole());
                accountResponse.setDriverId(driverId);

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
     * Register Driver - Public endpoint
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            RegisterResponse response = authService.registerDriver(registerRequest);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Driver registered successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Registration error: " + e.getMessage()));
        }
    }

    /**
     * Register Admin - CHỈ admin hiện tại mới gọi được
     */
    @PostMapping("/register-admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> registerAdmin(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            RegisterResponse response = authService.registerAdmin(registerRequest);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Admin registered successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Registration error: " + e.getMessage()));
        }
    }

    /**
     * Register First Admin - CHỈ khi chưa có admin nào
     */
    @PostMapping("/register-first-admin")
    public ResponseEntity<?> registerFirstAdmin(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            RegisterResponse response = authService.registerFirstAdmin(registerRequest);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("First admin created successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Registration error: " + e.getMessage()));
        }
    }
    /**
     * Check if any admin exists in the system
     * GET /api/auth/has-admin
     * Public endpoint to help FE decide registration flow
     */
    @GetMapping("/has-admin")
    public ResponseEntity<?> hasAdmin() {
        try {
            boolean adminExists = authService.hasAdmin();
            return ResponseEntity.ok(ApiResponse.success("Admin check completed", adminExists));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error checking admin existence: " + e.getMessage()));
        }
    }
    /**
     * Logout endpoint
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        try {
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

    // Thêm vào AuthController.java

    private final PasswordResetService passwordResetService; // Inject thêm

    /**
     * Send OTP for password reset
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            passwordResetService.sendPasswordResetOtp(request.getEmail());
            return ResponseEntity.ok(ApiResponse.success("OTP sent to your email"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error sending OTP: " + e.getMessage()));
        }
    }

    /**
     * Verify OTP
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        try {
            boolean isValid = passwordResetService.verifyOtp(request.getEmail(), request.getOtp());
            if (isValid) {
                return ResponseEntity.ok(ApiResponse.success("OTP verified successfully"));
            }
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid or expired OTP"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error verifying OTP: " + e.getMessage()));
        }
    }

    /**
     * Reset password
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            passwordResetService.resetPassword(
                    request.getEmail(),
                    request.getOtp(),
                    request.getNewPassword()
            );
            return ResponseEntity.ok(ApiResponse.success("Password reset successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error resetting password: " + e.getMessage()));
        }
    }
}