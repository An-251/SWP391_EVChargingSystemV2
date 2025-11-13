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
        stationEmployeeRepository.deleteById(id);
    }

    @Override
    public StationEmployee findById(Integer id) {
        // Nên dùng orElseThrow để xử lý an toàn hơn
        return stationEmployeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("StationEmployee not found with ID: " + id));
    }

    @Override
    public StationEmployee findByAccountId(Integer accountId) {
        return stationEmployeeRepository.findByAccount_Id(accountId)
                .orElseThrow(() -> new RuntimeException("StationEmployee not found for Account ID: " + accountId));
    }

    @Override
    public List<StationEmployee> findAll() {
        return stationEmployeeRepository.findAll(); // Sửa lại: Trả về tất cả
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
