package swp391.fa25.swp391.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import swp391.fa25.swp391.dto.request.CreateEmployeeRequest;
import swp391.fa25.swp391.dto.request.RegisterRequest;
// Đã loại bỏ: import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.dto.response.EmployeeResponse;
import swp391.fa25.swp391.dto.response.RegisterResponse;
import swp391.fa25.swp391.entity.Account;
import swp391.fa25.swp391.entity.Admin;
import swp391.fa25.swp391.entity.Driver;
import swp391.fa25.swp391.entity.StationEmployee;
import swp391.fa25.swp391.repository.AccountRepository;
import swp391.fa25.swp391.repository.AdminRepository;
import swp391.fa25.swp391.repository.DriverRepository;
import swp391.fa25.swp391.repository.StationEmployeeRepository;
import swp391.fa25.swp391.security.JwtTokenProvider;

import java.time.Instant;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthService {

    private final AccountRepository accountRepository;
    private final DriverRepository driverRepository;
    private final AdminRepository adminRepository;
    private final StationEmployeeRepository stationEmployeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

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

        // 1. Tạo Account với role = "Driver"
        Account account = new Account();
        account.setUsername(request.getUsername());
        account.setEmail(request.getEmail());
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setAccountRole("Driver");
        account.setStatus("ACTIVE");
        account.setBalance(0.0);
        account.setCreatedDate(Instant.now());

        Account savedAccount = accountRepository.save(account);

        // 2. NGAY LẬP TỨC tạo Driver record
        Driver driver = new Driver();
        driver.setAccount(savedAccount);

        Driver savedDriver = driverRepository.save(driver);

        // 3. Generate token và response với Builder
        String jwt = jwtTokenProvider.generateToken(savedAccount);

        RegisterResponse registerResponse = RegisterResponse.builder()
                .message("Driver registered successfully")
                .accountId(savedAccount.getId())
                .username(savedAccount.getUsername())
                .email(savedAccount.getEmail())
                .role(savedAccount.getAccountRole())
                .token(jwt)
                .driverId(savedDriver.getId())
                .adminId(null)
                .employeeId(null)
                .enterpriseId(null)
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
    @PreAuthorize("hasAnyAuthority('ADMIN')")
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
        account.setStatus("ACTIVE");
        account.setBalance(0.0);
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
                .enterpriseId(null)
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
        account.setStatus("ACTIVE");
        account.setBalance(0.0);
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
                .enterpriseId(null)
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
    @PreAuthorize("hasAuthority('ADMIN')")
    public EmployeeResponse createStationEmployee(CreateEmployeeRequest request) { // Sửa kiểu trả về
        // Validate và NÉM EXCEPTION
        if (accountRepository.existsByUsername(request.getUsername())) {
            // NÊN: throw new DuplicateResourceException("Username already exists");
            throw new RuntimeException("Username already exists");
        }

        if (accountRepository.existsByEmail(request.getEmail())) {
            // NÊN: throw new DuplicateResourceException("Email already in use");
            throw new RuntimeException("Email already in use");
        }

        // 1. Tạo Account với role = "StationEmployee"
        Account account = new Account();
        account.setUsername(request.getUsername());
        account.setEmail(request.getEmail());
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setFullName(request.getFullName());
        account.setPhone(request.getPhone());
        account.setAccountRole("StationEmployee");
        account.setStatus("ACTIVE");
        account.setBalance(0.0);
        account.setCreatedDate(Instant.now());

        Account savedAccount = accountRepository.save(account);

        // 2. NGAY LẬP TỨC tạo StationEmployee record
        StationEmployee employee = new StationEmployee();
        employee.setAccount(savedAccount);
        employee.setPosition(request.getPosition());

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
                .build();

        // Trả về EmployeeResponse
        return employeeResponse;
    }
    public boolean hasAdmin() {
        return accountRepository.existsByAccountRole("Admin");
    }
}