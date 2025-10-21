package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import swp391.fa25.swp391.entity.Admin;
import swp391.fa25.swp391.entity.Facility;
import swp391.fa25.swp391.repository.AdminRepository;
import swp391.fa25.swp391.service.IService.IAdminService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminService implements IAdminService {
    private final AdminRepository adminRepository;
    @Override
    public Admin findById(Integer id) {
        return adminRepository.findById(id).orElse(null);
    }
    @Override
    public List<Admin> findAllAccounts() {

        return adminRepository.findAll();
    }
    @Override
    public void deleteAccount(Integer id) {

        adminRepository.deleteById(id);
    }
    @Override
    public Admin findByAccountId(Integer accountId) {
        return adminRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("Admin not found for account ID: " + accountId));
    }
}
