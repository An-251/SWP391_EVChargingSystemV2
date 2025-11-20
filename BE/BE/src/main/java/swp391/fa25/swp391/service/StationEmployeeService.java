package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import swp391.fa25.swp391.entity.Account; // THÊM IMPORT
import swp391.fa25.swp391.entity.StationEmployee;
import swp391.fa25.swp391.repository.AccountRepository; // THÊM IMPORT
import swp391.fa25.swp391.repository.StationEmployeeRepository;
import swp391.fa25.swp391.service.IService.IStationEmployeeService;

import java.util.List;
import java.util.Optional; // THÊM IMPORT

@Service
@RequiredArgsConstructor
public class StationEmployeeService implements IStationEmployeeService {

    private final StationEmployeeRepository stationEmployeeRepository;
    private final AccountRepository accountRepository; // <-- TIÊM ACCOUNT REPOSITORY

    @Override
    public StationEmployee register(StationEmployee stationEmployee) {
        return stationEmployeeRepository.save(stationEmployee);
    }

    @Override
    public StationEmployee updateStationEmployee(StationEmployee StationEmployee) {
        return stationEmployeeRepository.save(StationEmployee);
    }

    @Override
    public void deleteStationEmployee(Integer id) {
        // SOFT DELETE
        StationEmployee employee = stationEmployeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("StationEmployee not found with id: " + id));
        
        employee.setIsDeleted(true);
        employee.setDeletedAt(java.time.Instant.now());
        
        // Lấy username của người thực hiện xóa
        org.springframework.security.core.Authentication auth = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            employee.setDeletedBy(auth.getName());
        }
        
        stationEmployeeRepository.save(employee);
    }

    @Override
    public StationEmployee findById(Integer id) {
        // Nên dùng orElseThrow để xử lý an toàn hơn
        return stationEmployeeRepository.findByIdNotDeleted(id)
                .orElseThrow(() -> new RuntimeException("StationEmployee not found with ID: " + id));
    }

    @Override
    public StationEmployee findByAccountId(Integer accountId) {
        return stationEmployeeRepository.findByAccount_Id(accountId)
                .orElseThrow(() -> new RuntimeException("StationEmployee not found for Account ID: " + accountId));
    }

    @Override
    public List<StationEmployee> findAll() {
        return stationEmployeeRepository.findAllNotDeleted();
    }

    // ===================================
    // ==== IMPLEMENT LOGIC MỚI ====
    // ===================================

    /**
     * Tìm StationEmployee bằng username (lấy từ Account)
     */
    @Override
    public Optional<StationEmployee> findByUsername(String username) {
        // 1. Tìm Account bằng username
        Optional<Account> accountOpt = accountRepository.findByUsername(username); // Giả sử AccountRepository có hàm này

        if (accountOpt.isEmpty()) {
            return Optional.empty();
        }

        // 2. Từ Account, tìm StationEmployee
        return stationEmployeeRepository.findByAccount(accountOpt.get());
    }
}
