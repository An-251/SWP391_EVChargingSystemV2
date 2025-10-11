package swp391.fa25.swp391.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.Cookie;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.LoginRequest;
import swp391.fa25.swp391.dto.request.RegisterRequest;
import swp391.fa25.swp391.dto.request.UpdateProfileRequest;
import swp391.fa25.swp391.dto.response.AccountResponse;
import swp391.fa25.swp391.dto.response.LoginResponse;
import swp391.fa25.swp391.dto.response.MessageResponse;
import swp391.fa25.swp391.dto.response.RegisterResponse;
import swp391.fa25.swp391.entity.Account;
import swp391.fa25.swp391.security.JwtTokenProvider;
import swp391.fa25.swp391.service.IService.IAccountService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174"})
public class AccountController {

    private final JwtTokenProvider jwtTokenProvider;
    private final IAccountService accountService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest accountRequest) {
        boolean isLoginSuccessful = accountService.login(accountRequest.getUsername(), accountRequest.getPassword());
        List<Account> accounts = accountService.findByUsername(accountRequest.getUsername());

        if (isLoginSuccessful && !accounts.isEmpty()) {
            Account account = accounts.get(0);
            String token = jwtTokenProvider.generateToken(account);
            AccountResponse accountResponse = new AccountResponse();
            accountResponse.setId(account.getId());
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
        account.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        account.setAccountRole("Driver");
        account.setStatus("ACTIVE");

        // Save account
        Account savedAccount = accountService.register(account);

        // Generate JWT token
        String jwt = jwtTokenProvider.generateToken(savedAccount);

        // Create account response for register
        AccountResponse accountResponse = new AccountResponse();
        accountResponse.setId(savedAccount.getId());
        accountResponse.setUsername(savedAccount.getUsername());
        accountResponse.setFullName(savedAccount.getFullName());
        accountResponse.setEmail(savedAccount.getEmail());
        accountResponse.setRole(savedAccount.getAccountRole());

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
            return ResponseEntity.ok(accounts.get(0));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccountResponse> updateAccount(@PathVariable Integer id, @RequestBody UpdateProfileRequest updateRequest) {
        try {
            Optional<Account> existingAccountOpt = accountService.findById(id);
            if (existingAccountOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Account existingAccount = getAccount(updateRequest, existingAccountOpt);

            Account updatedAccount = accountService.updateAccount(existingAccount);

            // Return updated account response
            AccountResponse accountResponse = new AccountResponse();
            accountResponse.setId(updatedAccount.getId());
            accountResponse.setUsername(updatedAccount.getUsername());
            accountResponse.setFullName(updatedAccount.getFullName());
            accountResponse.setEmail(updatedAccount.getEmail());
            accountResponse.setRole(updatedAccount.getAccountRole());

            return ResponseEntity.ok(accountResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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

    @DeleteMapping("/{name}")
    public ResponseEntity<Void> deleteAccount(@PathVariable String name) {
        boolean deleted = accountService.deleteAccount(name);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(HttpServletRequest request, HttpServletResponse response) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        Cookie cookie = new Cookie("username", null);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<String> dashboard(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("username") != null) {
            return ResponseEntity.ok("Welcome " + session.getAttribute("username"));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login first");
    }
}