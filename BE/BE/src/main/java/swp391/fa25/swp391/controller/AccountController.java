package swp391.fa25.swp391.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.LoginResponse;
import swp391.fa25.swp391.entity.Account;
import swp391.fa25.swp391.security.JwtTokenProvider;
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

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> login(@RequestBody Account accountRequest) {
        boolean isLoginSuccessful = accountService.login(accountRequest.getUsername(), accountRequest.getPassword());
        List<Account> accounts = accountService.findByUsername(accountRequest.getUsername());

        if (isLoginSuccessful && !accounts.isEmpty()) {
            Account account = accounts.get(0);
            String token = jwtTokenProvider.generateToken(account);

            return ResponseEntity.ok(new LoginResponse(token, account));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PostMapping("/login")
    public ResponseEntity<Account> login(@RequestBody Account accountRequest, HttpServletResponse response) {
        boolean isLoginSuccessful = accountService.login(accountRequest.getUsername(), accountRequest.getPassword());
        List<Account> accounts = accountService.findByUsername(accountRequest.getUsername());

        if (isLoginSuccessful && !accounts.isEmpty()) {
            Account account = accounts.get(0);

            // Create cookie
            Cookie cookie = new Cookie("username", account.getUsername());
            cookie.setMaxAge(60 * 60 * 24 * 365);
            cookie.setPath("/");
            response.addCookie(cookie);

            return ResponseEntity.ok(account);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @GetMapping("/username/{name}")
    public ResponseEntity<Account> getAccountByName(@PathVariable String name) {
        List<Account> accounts = accountService.findByUsername(name);
        if (!accounts.isEmpty()) {
            return ResponseEntity.ok(accounts.get(0));
        }
        return ResponseEntity.notFound().build();
    }
    @GetMapping
    public ResponseEntity<List<Account>> getAllAccounts() {
        return ResponseEntity.ok(accountService.findAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Account> updateAccount(@PathVariable Integer id, @Validated @RequestBody Account account) {
        account.setId(id);
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
    public ResponseEntity<String> logout(HttpServletRequest request, HttpServletResponse response) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        Cookie cookie = new Cookie("username", null);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        return ResponseEntity.ok("Logged out successfully");
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
