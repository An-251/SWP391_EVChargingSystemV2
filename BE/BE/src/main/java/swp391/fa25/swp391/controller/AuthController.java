package swp391.fa25.swp391.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.LoginRequest;
import swp391.fa25.swp391.dto.request.RegisterRequest;
import swp391.fa25.swp391.dto.request.SocialLoginRequest;
import swp391.fa25.swp391.dto.request.VerifyEmailRequest;
import swp391.fa25.swp391.dto.response.AccountResponse;
import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.dto.response.LoginResponse;
import swp391.fa25.swp391.dto.response.RegisterResponse;
import swp391.fa25.swp391.entity.Account;
import swp391.fa25.swp391.entity.Driver;
import swp391.fa25.swp391.entity.StationEmployee;
import swp391.fa25.swp391.repository.AccountRepository;
import swp391.fa25.swp391.repository.DriverRepository;
import swp391.fa25.swp391.repository.StationEmployeeRepository;
import swp391.fa25.swp391.security.JwtTokenProvider;
import swp391.fa25.swp391.service.AuthService;
import swp391.fa25.swp391.service.EmailVerificationService;
import swp391.fa25.swp391.service.PasswordResetService;

import java.util.Map;
import java.util.Optional;

/**
 * Authentication Controller
 * Handles login, register, and social login endpoints
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174"})
public class AuthController {

    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final AccountRepository accountRepository;
    private final DriverRepository driverRepository;
    private final StationEmployeeRepository stationEmployeeRepository;
    private final EmailVerificationService emailVerificationService;
    private final PasswordResetService passwordResetService;

    /**
     * Login endpoint
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            System.out.println("🔑 Login attempt for username: " + request.getUsername());

            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Get account
            Account account = accountRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new RuntimeException("Account not found"));

            // Generate JWT token
            String jwt = jwtTokenProvider.generateToken(account);

            // Get Driver ID if user is a Driver
            Integer driverId = null;
            Integer adminId = null;
            Integer employeeId = null;
            Integer facilityId = null;
            String facilityName = null;
            String position = null;

            String roleUpper = account.getAccountRole() != null ? account.getAccountRole().toUpperCase() : "";
            
            if ("DRIVER".equals(roleUpper)) {
                Driver driver = driverRepository.findByAccountId(account.getId())
                        .orElse(null);
                if (driver != null) {
                    driverId = driver.getId();
                }
            } else if ("STATION_EMPLOYEE".equals(roleUpper) || "STATIONEMPLOYEE".equals(roleUpper) || 
                       "CHARGING STATION OPERATOR".equals(roleUpper)) {
                // Get employee details including facility (handle multiple role formats)
                System.out.println("🔍 Fetching employee details for account ID: " + account.getId());
                StationEmployee employee = stationEmployeeRepository.findByAccount_Id(account.getId())
                        .orElse(null);
                if (employee != null) {
                    employeeId = employee.getId();
                    position = employee.getPosition();
                    System.out.println("✅ Found employee ID: " + employeeId + ", Position: " + position);
                    
                    if (employee.getFacility() != null) {
                        facilityId = employee.getFacility().getId();
                        facilityName = employee.getFacility().getName();
                        System.out.println("✅ Found facility ID: " + facilityId + ", Name: " + facilityName);
                    } else {
                        System.out.println("⚠️ Employee has no facility assigned");
                    }
                } else {
                    System.out.println("❌ No StationEmployee found for account ID: " + account.getId());
                }
            }

            // Build response
            AccountResponse accountResponse = AccountResponse.builder()
                    .id(account.getId())
                    .username(account.getUsername())
                    .email(account.getEmail())
                    .fullName(account.getFullName())
                    .role(account.getAccountRole())
                    .phone(account.getPhone())
                    .dob(account.getDob())
                    .gender(account.getGender())
                    .status(account.getStatus())
                    .balance(null)
                    .driverId(driverId)
                    .adminId(adminId)
                    .employeeId(employeeId)
                    .facilityId(facilityId)
                    .facilityName(facilityName)
                    .position(position)
                    .build();

            LoginResponse loginResponse = LoginResponse.builder()
                    .token(jwt)
                    .account(accountResponse)
                    .build();

            System.out.println("✅ Login successful for user: " + request.getUsername());
            return ResponseEntity.ok(ApiResponse.success("Login successful", loginResponse));

        } catch (BadCredentialsException e) {
            System.err.println("❌ Invalid credentials for username: " + request.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid username or password"));
        } catch (Exception e) {
            System.err.println("❌ Login error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Login failed: " + e.getMessage()));
        }
    }

    /**
     * Register Driver endpoint
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerDriver(@Valid @RequestBody RegisterRequest request) {
        try {
            System.out.println("📝 Driver registration attempt for username: " + request.getUsername());

            RegisterResponse response = authService.registerDriver(request);

            System.out.println("✅ Driver registered successfully: " + request.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Driver registered successfully", response));

        } catch (RuntimeException e) {
            System.err.println("❌ Registration error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Unexpected registration error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Registration failed: " + e.getMessage()));
        }
    }

    /**
     * Register First Admin endpoint
     * POST /api/auth/register-first-admin
     */
    @PostMapping("/register-first-admin")
    public ResponseEntity<ApiResponse> registerFirstAdmin(@Valid @RequestBody RegisterRequest request) {
        try {
            System.out.println("👑 First admin registration attempt for username: " + request.getUsername());

            // Check if admin already exists
            if (authService.hasAdmin()) {
                System.err.println("⚠️ Admin already exists");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Admin already exists. Use regular admin registration endpoint."));
            }

            RegisterResponse response = authService.registerFirstAdmin(request);

            System.out.println("✅ First admin registered successfully: " + request.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("First admin registered successfully", response));

        } catch (RuntimeException e) {
            System.err.println("❌ First admin registration error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Unexpected registration error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Registration failed: " + e.getMessage()));
        }
    }

    /**
     * Register additional Admin (by existing Admin)
     * POST /api/auth/register-admin
     */
    @PostMapping("/register-admin")
    public ResponseEntity<ApiResponse> registerAdmin(@Valid @RequestBody RegisterRequest request) {
        try {
            System.out.println("👑 Admin registration attempt for username: " + request.getUsername());

            // Use the same service method as first admin
            RegisterResponse response = authService.registerFirstAdmin(request);

            System.out.println("✅ Admin registered successfully: " + request.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Admin registered successfully", response));

        } catch (RuntimeException e) {
            System.err.println("❌ Admin registration error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Unexpected registration error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Registration failed: " + e.getMessage()));
        }
    }

    /**
     * Social Login (Google, Facebook) endpoint
     * POST /api/auth/social-login
     */
    @PostMapping("/social-login")
    public ResponseEntity<ApiResponse> socialLogin(@Valid @RequestBody SocialLoginRequest request) {
        try {
            System.out.println("🌐 Social login attempt for email: " + request.getEmail());

            LoginResponse response = authService.handleSocialLogin(request);

            System.out.println("✅ Social login successful for: " + request.getEmail());
            return ResponseEntity.ok(ApiResponse.success("Social login successful", response));

        } catch (Exception e) {
            System.err.println("❌ Social login error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Social login failed: " + e.getMessage()));
        }
    }

    /**
     * Check if admin exists
     * GET /api/auth/has-admin
     */
    @GetMapping("/has-admin")
    public ResponseEntity<ApiResponse> hasAdmin() {
        boolean exists = authService.hasAdmin();
        return ResponseEntity.ok(ApiResponse.success("Admin check completed", exists));
    }

    /**
     * Logout endpoint (client-side token removal)
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout() {
        // JWT tokens are stateless, so logout is handled client-side by removing the token
        // This endpoint is optional and mainly for consistency
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }

    /**
     * Verify email with verification code
     * POST /api/auth/verify-email
     */
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        try {
            System.out.println("📧 Email verification attempt for: " + request.getEmail());
            
            emailVerificationService.verifyEmail(request.getEmail(), request.getVerificationCode());
            
            System.out.println("✅ Email verified successfully: " + request.getEmail());
            return ResponseEntity.ok(ApiResponse.success("Email verified successfully"));
            
        } catch (RuntimeException e) {
            System.err.println("❌ Email verification error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Unexpected verification error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Email verification failed"));
        }
    }

    /**
     * Resend verification code to email
     * POST /api/auth/resend-verification
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse> resendVerification(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Email is required"));
            }
            
            System.out.println("📧 Resend verification code for: " + email);
            
            emailVerificationService.resendVerificationCode(email);
            
            System.out.println("✅ Verification code resent to: " + email);
            return ResponseEntity.ok(ApiResponse.success("Verification code sent successfully"));
            
        } catch (RuntimeException e) {
            System.err.println("❌ Resend verification error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Unexpected resend error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to resend verification code"));
        }
    }

    /**
     * Forgot Password - Send OTP to email
     * POST /api/auth/forgot-password
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Email is required"));
            }

            System.out.println("🔑 Forgot password request for email: " + email);

            passwordResetService.sendPasswordResetOtp(email);

            System.out.println("✅ Password reset OTP sent to: " + email);
            return ResponseEntity.ok(ApiResponse.success("OTP has been sent to your email"));

        } catch (RuntimeException e) {
            System.err.println("❌ Forgot password error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Unexpected forgot password error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to send OTP"));
        }
    }

    /**
     * Verify OTP for password reset
     * POST /api/auth/verify-otp
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse> verifyOtp(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String otp = request.get("otp");

            if (email == null || email.trim().isEmpty() || otp == null || otp.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Email and OTP are required"));
            }

            System.out.println("🔍 Verifying OTP for email: " + email);

            boolean isValid = passwordResetService.verifyOtp(email, otp);

            if (isValid) {
                System.out.println("✅ OTP verified successfully for: " + email);
                return ResponseEntity.ok(ApiResponse.success("OTP verified successfully"));
            } else {
                System.out.println("❌ Invalid or expired OTP for: " + email);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Invalid or expired OTP"));
            }

        } catch (Exception e) {
            System.err.println("❌ OTP verification error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to verify OTP"));
        }
    }

    /**
     * Reset Password with OTP
     * POST /api/auth/reset-password
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String otp = request.get("otp");
            String newPassword = request.get("newPassword");

            if (email == null || otp == null || newPassword == null ||
                email.trim().isEmpty() || otp.trim().isEmpty() || newPassword.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Email, OTP, and new password are required"));
            }

            if (newPassword.length() < 8) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Password must be at least 8 characters"));
            }

            System.out.println("🔐 Resetting password for email: " + email);

            passwordResetService.resetPassword(email, otp, newPassword);

            System.out.println("✅ Password reset successfully for: " + email);
            return ResponseEntity.ok(ApiResponse.success("Password reset successfully"));

        } catch (RuntimeException e) {
            System.err.println("❌ Password reset error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Unexpected password reset error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to reset password"));
        }
    }
}
