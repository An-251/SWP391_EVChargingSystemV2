package swp391.fa25.swp391.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.dto.response.EmployeeResponse;
import swp391.fa25.swp391.entity.Account;
import swp391.fa25.swp391.entity.StationEmployee;
import swp391.fa25.swp391.repository.AccountRepository;
import swp391.fa25.swp391.service.IService.IAccountService;
import swp391.fa25.swp391.service.IService.IStationEmployeeService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Station Employee Controller - Admin management of station employees
 */
@RestController
@RequestMapping("/api/station-employees")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StationEmployeeController {

    private final IStationEmployeeService stationEmployeeService;
    private final IAccountService accountService;
    private final AccountRepository accountRepository;

    /**
     * Get all station employees with pagination
     * GET /api/station-employees?page=0&size=10
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllEmployees(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        List<StationEmployee> employees = stationEmployeeService.findAll();
        
        // Manual pagination
        int start = page * size;
        int end = Math.min((page + 1) * size, employees.size());
        List<StationEmployee> pagedEmployees = employees.subList(Math.min(start, employees.size()), end);
        
        List<EmployeeResponse> responses = pagedEmployees.stream()
                .map(this::buildEmployeeResponse)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("content", responses);
        response.put("currentPage", page);
        response.put("totalItems", employees.size());
        response.put("totalPages", (int) Math.ceil((double) employees.size() / size));

        return ResponseEntity.ok(response);
    }

    /**
     * Get current employee profile (for logged-in employee)
     * GET /api/station-employees/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getCurrentEmployeeProfile() {
        try {
            // Get authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            // Find account by username using repository
            Account account = accountRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Account not found with username: " + username));
            
            // Find employee by account
            StationEmployee employee = stationEmployeeService.findByAccountId(account.getId());
            
            EmployeeResponse response = buildEmployeeResponse(employee);
            return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Employee profile not found: " + e.getMessage()));
        }
    }

    /**
     * Update current employee profile
     * PUT /api/station-employees/profile
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse> updateCurrentEmployeeProfile(
            @RequestBody Map<String, String> request) {
        try {
            // Get authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            // Find account by username using repository
            Account account = accountRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Account not found with username: " + username));
            
            // Find employee by account
            StationEmployee employee = stationEmployeeService.findByAccountId(account.getId());
            
            // Update account fields if provided
            if (request.containsKey("fullName")) {
                account.setFullName(request.get("fullName"));
            }
            if (request.containsKey("phone")) {
                account.setPhone(request.get("phone"));
            }
            
            // Save updates
            StationEmployee updatedEmployee = stationEmployeeService.updateStationEmployee(employee);
            EmployeeResponse response = buildEmployeeResponse(updatedEmployee);

            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Error updating profile: " + e.getMessage()));
        }
    }

    /**
     * Get employee by ID
     * GET /api/station-employees/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getEmployeeById(@PathVariable Integer id) {
        try {
            StationEmployee employee = stationEmployeeService.findById(id);
            EmployeeResponse response = buildEmployeeResponse(employee);
            return ResponseEntity.ok(ApiResponse.success("Employee found", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Employee not found"));
        }
    }

    /**
     * Update employee
     * PUT /api/station-employees/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateEmployee(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {
        try {
            StationEmployee existingEmployee = stationEmployeeService.findById(id);

            // Update position if provided
            if (request.containsKey("position")) {
                existingEmployee.setPosition(request.get("position"));
            }

            // Update account fields if provided
            Account account = existingEmployee.getAccount();
            if (account != null) {
                if (request.containsKey("fullName")) {
                    account.setFullName(request.get("fullName"));
                }
                if (request.containsKey("email")) {
                    account.setEmail(request.get("email"));
                }
                if (request.containsKey("phone")) {
                    account.setPhone(request.get("phone"));
                }
                if (request.containsKey("status")) {
                    account.setStatus(request.get("status"));
                }
            }

            StationEmployee updatedEmployee = stationEmployeeService.updateStationEmployee(existingEmployee);
            EmployeeResponse response = buildEmployeeResponse(updatedEmployee);

            return ResponseEntity.ok(ApiResponse.success("Employee updated successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Error updating employee: " + e.getMessage()));
        }
    }

    /**
     * Delete employee
     * DELETE /api/station-employees/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteEmployee(@PathVariable Integer id) {
        try {
            stationEmployeeService.findById(id); // Check if exists
            stationEmployeeService.deleteStationEmployee(id);
            return ResponseEntity.ok(ApiResponse.success("Employee deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Employee not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error deleting employee: " + e.getMessage()));
        }
    }

    // ==================== HELPER METHODS ====================

    private EmployeeResponse buildEmployeeResponse(StationEmployee employee) {
        EmployeeResponse.EmployeeResponseBuilder builder = EmployeeResponse.builder()
                .employeeId(employee.getId())
                .position(employee.getPosition());
        
        if (employee.getAccount() != null) {
            Account account = employee.getAccount();
            builder.accountId(account.getId())
                   .username(account.getUsername())
                   .fullName(account.getFullName())
                   .email(account.getEmail())
                   .phone(account.getPhone())
                   .status(account.getStatus());
        }
        
        if (employee.getFacility() != null) {
            builder.facilityId(employee.getFacility().getId())
                   .facilityName(employee.getFacility().getName());
        }
        
        return builder.build();
    }
}
