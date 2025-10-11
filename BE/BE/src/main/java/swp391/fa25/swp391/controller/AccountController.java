<<<<<<< Updated upstream
package swp391.fa25.swp391.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
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
import swp391.fa25.swp391.service.IService.IAccountService;

import java.time.Instant;
import java.util.List;

=======
>>>>>>> Stashed changes
@RestController
@RequestMapping("/api/accounts") // Đổi thành /api/auth thì sẽ tường minh hơn
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000") // Chỉ định rõ origin của FE thay vì "*"
public class AccountController {

    private final JwtTokenProvider jwtTokenProvider;
    private final IAccountService accountService;
<<<<<<< Updated upstream
    private final PasswordEncoder passwordEncoder;

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
=======
    // Inject PasswordEncoder để hash mật khẩu khi đăng ký
    private final PasswordEncoder passwordEncoder;

    // 1. SỬA LẠI ENDPOINT LOGIN CHO ĐÚNG
    @PostMapping("/login") // Đổi tên từ /register thành /login
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        boolean isLoginSuccessful = accountService.login(loginRequest.getUsername(), loginRequest.getPassword());
        
        // Nên có một phương thức trả về Optional<Account> để tránh lỗi Null
        Account account = accountService.findByUsername(loginRequest.getUsername()).stream().findFirst().orElse(null);

        if (isLoginSuccessful && account != null) {
            String token = jwtTokenProvider.generateToken(account); // Token phải chứa cả role
            // Dùng DTO để không lộ thông tin nhạy cảm
            UserDTO userDTO = new UserDTO(account.getId(), account.getUsername(), account.getEmail(), account.getRole());
            return ResponseEntity.ok(new LoginResponse(token, userDTO));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    // 2. TẠO ENDPOINT REGISTER ĐÚNG NGHĨA
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Account newAccount) {
        // Kiểm tra xem username đã tồn tại chưa
        if (accountService.findByUsername(newAccount.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username đã tồn tại!");
>>>>>>> Stashed changes
        }
        
        // Hash mật khẩu trước khi lưu vào DB
        newAccount.setPassword(passwordEncoder.encode(newAccount.getPassword()));
        
        // Set role mặc định, ví dụ 'DRIVER'
        // newAccount.setRole("DRIVER");
        
        Account savedAccount = accountService.createAccount(newAccount);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAccount);
    }
<<<<<<< Updated upstream

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
=======
    
    // 3. XÓA CÁC ENDPOINT DÙNG SESSION VÀ COOKIE KHÔNG AN TOÀN
    // Xóa endpoint /login cũ
    // Xóa endpoint /logout dùng session
    // Xóa endpoint /dashboard dùng session
    
    // ... các endpoint khác (GET, PUT, DELETE) sẽ được bảo vệ ở bước 2
}
>>>>>>> Stashed changes
