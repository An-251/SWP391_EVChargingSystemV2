package swp391.fa25.swp391.service;

import jakarta.transaction.Transactional;

import org.springframework.security.crypto.password.PasswordEncoder;
import swp391.fa25.swp391.entity.Account;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import swp391.fa25.swp391.repository.models.AccountRepository;
import swp391.fa25.swp391.security.PasswordEncoderConfig;
import swp391.fa25.swp391.service.IService.IAccountService;

import java.util.List;
import java.util.Optional;

@Service

public class AccountService implements IAccountService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public AccountService(PasswordEncoder passwordEncoder,
                       AccountRepository accountRepository) {
        this.passwordEncoder = passwordEncoder;
        this.accountRepository = accountRepository;
    }
    @Override
    @Transactional
    public Account register(Account account) {

        return accountRepository.save(account);
    }

    @Override
    public boolean login(String username, String password) {
        // Dùng findAllByUsername vì AccountRepository đã được sửa để trả về List
        List<Account> accounts = accountRepository.findAllByUsername(username);
        if (accounts.isEmpty()) {
            return false;
        }

        // Use passwordEncoder.matches instead of equals
        return passwordEncoder.matches(password, accounts.getFirst().getPassword());
    }

    @Override
    @Transactional // Phương thức update cần Transactional
    public Account updateAccount(Account account) {
        Optional<Account> existingOpt = accountRepository.findById(account.getId());
        if (existingOpt.isEmpty()) {
            return null; // hoặc ném NotFoundException
        }

        Account existing = existingOpt.get();

        //  Chỉ cập nhật các field cho phép
        if (account.getUsername() != null) existing.setUsername(account.getUsername());
        if (account.getFullName() != null) existing.setFullName(account.getFullName());
        if (account.getGender() != null) existing.setGender(account.getGender());
        if (account.getDob() != null) existing.setDob(account.getDob());
        if (account.getPhone() != null) existing.setPhone(account.getPhone());
        if (account.getEmail() != null) existing.setEmail(account.getEmail());

        return accountRepository.save(existing);
    }

    @Override
    public List<Account> findByEmail(String email) {
        // Dùng findAllByEmail
        return accountRepository.findAllByEmail(email);
    }

    @Override
    public List<Account> findByUsername(String username) {
        // Dùng findAllByUsername
        return accountRepository.findAllByUsername(username);
    }


    @Override
    public boolean existsByUsername(String username) {
        // Dùng existsByUsername tự sinh của JpaRepository
        return accountRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        // Dùng existsByEmail tự sinh của JpaRepository
        return accountRepository.existsByEmail(email);
    }

    @Override
    public Optional<Account> findById(Integer id) {
        // Dùng findById tự sinh của JpaRepository
        return accountRepository.findById(id);
    }

    @Override
    public List<Account> findAll() {
        // Dùng findAll tự sinh của JpaRepository
        return accountRepository.findAll();
    }


    @Override
    @Transactional // Phương thức xóa cần Transactional
    public boolean deleteAccount(String username) {
        // Sử dụng phương thức deleteByUsername đã thêm vào AccountRepository
        // Nó trả về số lượng bản ghi đã xóa
        Long deletedCount = accountRepository.deleteByUsername(username);
        return deletedCount > 0;
    }

    @Override
    @Transactional // Phương thức xóa cần Transactional
    public boolean deleteAccountById(Integer id) {
        // Sử dụng phương thức deleteById chuẩn của JpaRepository
        if (accountRepository.existsById(id)) {
            accountRepository.deleteById(id);
            return true;
        }
        return false;
    }

}