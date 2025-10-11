package swp391.fa25.swp391.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.LoginRequest;
import swp391.fa25.swp391.dto.request.RegisterRequest;
import swp391.fa25.swp391.dto.response.AccountResponse;
import swp391.fa25.swp391.dto.response.LoginResponse;
import swp391.fa25.swp391.dto.response.MessageResponse;
import swp391.fa25.swp391.dto.response.RegisterResponse;
import swp391.fa25.swp391.entity.Account;
import swp391.fa25.swp391.security.JwtTokenProvider;
import swp391.fa25.swp391.security.PasswordEncoderConfig;
import swp391.fa25.swp391.service.IService.IAccountService;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AccountController {
    private final JwtTokenProvider jwtTokenProvider;
    private final IAccountService accountService;
    private final PasswordEncoderConfig passwordEncoderConfig;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest accountRequest) {
        boolean isLoginSuccessful = accountService.login(accountRequest.getUsername(), accountRequest.getPassword());
        List<Account> accounts = accountService.findByUsername(accountRequest.getUsername());

        if (isLoginSuccessful && !accounts.isEmpty()) {
            Account account = accounts.getFirst();
            String token = jwtTokenProvider.generateToken(account);
            AccountResponse accountResponse = new AccountResponse();
            accountResponse.setUsername(account.getUsername());
            accountResponse.setFullName(account.getFullName());
            accountResponse.setEmail(account.getEmail());
            accountResponse.setRole(account.getAccountRole());

            return ResponseEntity.ok(new LoginResponse(token, accountResponse));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid RegisterRequest registerRequest) {
        // Check if username already exists
        if (accountService.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        // Check if email already exists
        if (accountService.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new account
        Account account = new Account();
        account.setUsername(registerRequest.getUsername());
        account.setEmail(registerRequest.getEmail());
        account.setPassword(passwordEncoderConfig.passwordEncoder().encode(registerRequest.getPassword()));
        account.setAccountRole("Driver");
        account.setStatus("ACTIVE");
        account.setCreatedDate(Instant.now());
        account.setBalance(0.0);

        // Save account
        Account savedAccount = accountService.register(account);

        // Generate JWT token
        String jwt = jwtTokenProvider.generateToken(savedAccount);

        return ResponseEntity.ok(new RegisterResponse(
                "User registered successfully!",
                savedAccount.getId(),
                savedAccount.getUsername(),
                savedAccount.getEmail(),
                savedAccount.getAccountRole(),
                jwt
        ));
    }

    @GetMapping("/username/{name}")
    public ResponseEntity<Account> getAccountByName(@PathVariable String name) {
        List<Account> accounts = accountService.findByUsername(name);
        if (!accounts.isEmpty()) {
            return ResponseEntity.ok(accounts.getFirst());
        }
        return ResponseEntity.notFound().build();
    }


    @PutMapping("/{id}")
    public ResponseEntity<Account> updateAccount(@PathVariable Integer id, @Validated @RequestBody Account account) {
        this.accountService.findById(id);
        Account updatedAccount = accountService.updateAccount(account);
        if (updatedAccount != null) {
            return ResponseEntity.ok(updatedAccount);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{name}")
    public ResponseEntity<Void> deleteAccount(@PathVariable String name) {
        boolean deleted = accountService.deleteAccount(name);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader(value = "Authorization", required = false) String token) {
        if (token != null && token.startsWith("Bearer ")) {

            return ResponseEntity.ok("Logged out successfully");
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No active session");
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        try {
            // Validate token and extract username
            String username = jwtTokenProvider.getUsernameFromToken(token);
            // Optionally fetch user info, or just greet
            return ResponseEntity.ok("Welcome " + username);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
        }
    }
}
