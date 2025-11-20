package swp391.fa25.swp391.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import swp391.fa25.swp391.dto.request.CreateEmployeeRequest;
import swp391.fa25.swp391.dto.request.RegisterRequest;
// Đã loại bỏ: import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.dto.response.AccountResponse;
import swp391.fa25.swp391.dto.response.EmployeeResponse;
import swp391.fa25.swp391.dto.response.LoginResponse;
import swp391.fa25.swp391.dto.response.RegisterResponse;
import swp391.fa25.swp391.entity.Account;
import swp391.fa25.swp391.entity.Admin;
import swp391.fa25.swp391.entity.Driver;
import swp391.fa25.swp391.entity.Facility;
import swp391.fa25.swp391.entity.StationEmployee;
import swp391.fa25.swp391.repository.AccountRepository;
import swp391.fa25.swp391.repository.AdminRepository;
import swp391.fa25.swp391.repository.DriverRepository;
import swp391.fa25.swp391.repository.FacilityRepository;
import swp391.fa25.swp391.repository.StationEmployeeRepository;
import swp391.fa25.swp391.security.JwtTokenProvider;

import java.time.Instant;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AccountRepository accountRepository;
    private final DriverRepository driverRepository;
    private final AdminRepository adminRepository;
    private final StationEmployeeRepository stationEmployeeRepository;
    private final FacilityRepository facilityRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailVerificationService emailVerificationService;

    /**
     * Register Driver - Trả về RegisterResponse.
     * Service layer sẽ ném Exception khi có lỗi.
     */
    @Transactional
    public RegisterResponse registerDriver(RegisterRequest request) { // Sửa kiểu trả về
        // Validate và NÉM EXCEPTION thay vì trả về ApiResponse.error()
        if (accountRepository.existsByUsername(request.getUsername())) {
            // NÊN: throw new DuplicateResourceException("Username already exists");
            throw new RuntimeException("Username already exists");
        }

        if (accountRepository.existsByEmail(request.getEmail())) {
            // NÊN: throw new DuplicateResourceException("Email already in use");
            throw new RuntimeException("Email already in use");
        }

        // 1. Tạo Account với role = "Driver" và status = "pending" (chờ xác thực email)
        Account account = new Account();
        account.setUsername(request.getUsername());
        account.setEmail(request.getEmail());
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setAccountRole("Driver");
        account.setStatus("pending"); // ⭐ Changed: Set to pending until email verified

        account.setCreatedDate(Instant.now());

        Account savedAccount = accountRepository.save(account);

        // 2. NGAY LẬP TỨC tạo Driver record
        Driver driver = new Driver();
        driver.setAccount(savedAccount);

        Driver savedDriver = driverRepository.save(driver);

        // 3. ⭐ Send email verification code
        try {
            emailVerificationService.sendVerificationCode(savedAccount.getEmail());
            log.info("✅ Verification email sent to: {}", savedAccount.getEmail());
        } catch (Exception e) {
            log.error("❌ Failed to send verification email: {}", e.getMessage());
            // Continue registration even if email fails
        }

        // 4. Generate token và response với Builder (token won't work until email verified)
        String jwt = jwtTokenProvider.generateToken(savedAccount);

        RegisterResponse registerResponse = RegisterResponse.builder()
                .message("Driver registered successfully. Please check your email to verify your account.")
                .accountId(savedAccount.getId())
                .username(savedAccount.getUsername())
                .email(savedAccount.getEmail())
                .role(savedAccount.getAccountRole())
                .token(jwt)
                .driverId(savedDriver.getId())
                .adminId(null)
                .employeeId(null)
                .build();

        // Trả về RegisterResponse
        return registerResponse;
    }

    // --------------------------------------------------

    /**
     * Register Admin - Trả về RegisterResponse.
     * Service layer sẽ ném Exception khi có lỗi.
     */
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public RegisterResponse registerAdmin(RegisterRequest request) { // Sửa kiểu trả về
        // Validate và NÉM EXCEPTION
        if (accountRepository.existsByUsername(request.getUsername())) {
            // NÊN: throw new DuplicateResourceException("Username already exists");
            throw new RuntimeException("Username already exists");
        }

        if (accountRepository.existsByEmail(request.getEmail())) {
            // NÊN: throw new DuplicateResourceException("Email already in use");
            throw new RuntimeException("Email already in use");
        }

        // 1. Tạo Account với role = "Admin"
        Account account = new Account();
        account.setUsername(request.getUsername());
        account.setEmail(request.getEmail());
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setAccountRole("Admin");
        account.setStatus("active");

        account.setCreatedDate(Instant.now());

        Account savedAccount = accountRepository.save(account);

        // 2. NGAY LẬP TỨC tạo Admin record
        Admin admin = new Admin();
        admin.setAccount(savedAccount);

        Admin savedAdmin = adminRepository.save(admin);

        // 3. Generate token và response với Builder
        String jwt = jwtTokenProvider.generateToken(savedAccount);

        RegisterResponse registerResponse = RegisterResponse.builder()
                .message("Admin registered successfully")
                .accountId(savedAccount.getId())
                .username(savedAccount.getUsername())
                .email(savedAccount.getEmail())
                .role(savedAccount.getAccountRole())
                .token(jwt)
                .adminId(savedAdmin.getId())
                .driverId(null)
                .employeeId(null)
                .build();

        // Trả về RegisterResponse
        return registerResponse;
    }

    // --------------------------------------------------

    /**
     * Register First Admin - Trả về RegisterResponse.
     * Service layer sẽ ném Exception khi có lỗi.
     */
    @Transactional
    public RegisterResponse registerFirstAdmin(RegisterRequest request) { // Sửa kiểu trả về
        // Kiểm tra đã có admin chưa và NÉM EXCEPTION
        if (accountRepository.existsByAccountRole("Admin")) {
            // NÊN: throw new BusinessException("Admin already exists. Use /register-admin endpoint instead.");
            throw new RuntimeException("Admin already exists. Use /register-admin endpoint instead.");
        }

        // Validate và NÉM EXCEPTION
        if (accountRepository.existsByUsername(request.getUsername())) {
            // NÊN: throw new DuplicateResourceException("Username already exists");
            throw new RuntimeException("Username already exists");
        }

        if (accountRepository.existsByEmail(request.getEmail())) {
            // NÊN: throw new DuplicateResourceException("Email already in use");
            throw new RuntimeException("Email already in use");
        }

        // 1. Tạo Account với role = "Admin"
        Account account = new Account();
        account.setUsername(request.getUsername());
        account.setEmail(request.getEmail());
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setAccountRole("Admin");
        account.setStatus("active");

        account.setCreatedDate(Instant.now());

        Account savedAccount = accountRepository.save(account);

        // 2. NGAY LẬP TỨC tạo Admin record
        Admin admin = new Admin();
        admin.setAccount(savedAccount);

        Admin savedAdmin = adminRepository.save(admin);

        // 3. Generate token và response với Builder
        String jwt = jwtTokenProvider.generateToken(savedAccount);

        RegisterResponse registerResponse = RegisterResponse.builder()
                .message("First admin registered successfully")
                .accountId(savedAccount.getId())
                .username(savedAccount.getUsername())
                .email(savedAccount.getEmail())
                .role(savedAccount.getAccountRole())
                .token(jwt)
                .adminId(savedAdmin.getId())
                .driverId(null)
                .employeeId(null)
                .build();

        // Trả về RegisterResponse
        return registerResponse;
    }

    // --------------------------------------------------

    /**
     * Admin tạo Station Employee - Trả về EmployeeResponse.
     * Service layer sẽ ném Exception khi có lỗi.
     */
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public EmployeeResponse createStationEmployee(CreateEmployeeRequest request) {
        // Validate và NÉM EXCEPTION
        if (accountRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        // Validate facility exists
        Facility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new RuntimeException("Facility not found with ID: " + request.getFacilityId()));

        // 1. Tạo Account với role = "StationEmployee"
        Account account = new Account();
        account.setUsername(request.getUsername());
        account.setEmail(request.getEmail());
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setFullName(request.getFullName());
        account.setPhone(request.getPhone());
        account.setAccountRole("StationEmployee");
        account.setStatus("active");

        account.setCreatedDate(Instant.now());

        Account savedAccount = accountRepository.save(account);

        // 2. NGAY LẬP TỨC tạo StationEmployee record với facility
        StationEmployee employee = new StationEmployee();
        employee.setAccount(savedAccount);
        employee.setPosition(request.getPosition());
        employee.setFacility(facility);

        StationEmployee savedEmployee = stationEmployeeRepository.save(employee);

        // 3. Build response với Builder
        EmployeeResponse employeeResponse = EmployeeResponse.builder()
                .employeeId(savedEmployee.getId())
                .accountId(savedAccount.getId())
                .username(savedAccount.getUsername())
                .email(savedAccount.getEmail())
                .fullName(savedAccount.getFullName())
                .phone(savedAccount.getPhone())
                .position(savedEmployee.getPosition())
                .status(savedAccount.getStatus())
                .facilityId(facility.getId())
                .facilityName(facility.getName())
                .build();

        // Trả về EmployeeResponse
        return employeeResponse;
    }
    
    public boolean hasAdmin() {
        return accountRepository.existsByAccountRole("Admin");
    }

    /**
     * Handle social login (Google, Facebook)
     * Creates account if doesn't exist, otherwise returns existing account
     */
    @Transactional
    public swp391.fa25.swp391.dto.response.LoginResponse handleSocialLogin(swp391.fa25.swp391.dto.request.SocialLoginRequest request) {
        // Verify Firebase token (optional - can add Firebase Admin SDK verification here)
        
        // Check if account exists by email
        Account account = accountRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    // Create new account if doesn't exist
                    Account newAccount = new Account();
                    newAccount.setEmail(request.getEmail());
                    newAccount.setUsername(generateUsernameFromEmail(request.getEmail()));
                    newAccount.setFullName(request.getFullName());
                    
                    // Generate random password (won't be used for social login)
                    String randomPassword = java.util.UUID.randomUUID().toString();
                    newAccount.setPassword(passwordEncoder.encode(randomPassword));
                    
                    // Default role is Driver for social login
                    newAccount.setAccountRole("Driver");
                    newAccount.setStatus("active");
                    newAccount.setCreatedDate(Instant.now());
                    
                    Account savedAccount = accountRepository.save(newAccount);
                    
                    // Create Driver record
                    Driver driver = new Driver();
                    driver.setAccount(savedAccount);
                    driverRepository.save(driver);
                    
                    return savedAccount;
                });
        
        // Get Driver ID if user is a Driver
        Integer driverId = null;
        if ("Driver".equals(account.getAccountRole())) {
            Driver driver = driverRepository.findByAccountId(account.getId())
                    .orElse(null);
            if (driver != null) {
                driverId = driver.getId();
            }
        }
        
        // Generate JWT token
        String jwt = jwtTokenProvider.generateToken(account);
        
        // Build AccountResponse
        swp391.fa25.swp391.dto.response.AccountResponse accountResponse = 
            swp391.fa25.swp391.dto.response.AccountResponse.builder()
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
                .build();
        
        // Build LoginResponse
        return swp391.fa25.swp391.dto.response.LoginResponse.builder()
                .token(jwt)
                .account(accountResponse)
                .build();
    }
    
    /**
     * Generate username from email
     */
    private String generateUsernameFromEmail(String email) {
        String baseUsername = email.split("@")[0];
        String username = baseUsername;
        int counter = 1;
        
        // Ensure unique username
        while (accountRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }
        
        return username;
    }
}