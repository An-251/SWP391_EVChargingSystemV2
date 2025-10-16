package swp391.fa25.swp391.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.LoginRequest;
import swp391.fa25.swp391.dto.request.RegisterRequest;
import swp391.fa25.swp391.dto.response.AccountResponse;
import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.dto.response.LoginResponse;
import swp391.fa25.swp391.dto.response.RegisterResponse;
import swp391.fa25.swp391.entity.Account;
import swp391.fa25.swp391.security.JwtTokenProvider;
import swp391.fa25.swp391.service.IService.IAccountService;

import java.time.Instant;
import java.util.List;

/**
 * Controller xử lý Authentication: Login, Register, Logout
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174"})
public class AuthController {

    private final JwtTokenProvider jwtTokenProvider;
    private final IAccountService accountService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Login endpoint
     * POST /api/auth/login
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
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
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
     * POST /api/auth/logout
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
}