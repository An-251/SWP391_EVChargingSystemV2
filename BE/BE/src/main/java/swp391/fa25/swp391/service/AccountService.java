package swp391.fa25.swp391.service;

import jakarta.transaction.Transactional;
import org.springframework.context.annotation.Lazy;
import swp391.fa25.swp391.entity.Account;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import swp391.fa25.swp391.repository.models.AccountRepository;
import swp391.fa25.swp391.security.PasswordEncoderConfig;
import swp391.fa25.swp391.service.IService.IAccountService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AccountService implements IAccountService {

    private final AccountRepository accountRepository;
    @Lazy
    private final PasswordEncoderConfig passwordEncoderConfig;
    @Override
    @Transactional
    public Account register(Account account) {


        return accountRepository.save(account);
    }

    @Override
    public boolean login(String username, String password) {
        List<Account> accounts = accountRepository.findByField("username", username);
        if (accounts.isEmpty()) {
            return false;
        }

        // Use passwordEncoder.matches instead of equals
        return passwordEncoderConfig.passwordEncoder().matches(password, accounts.getFirst().getPassword());
    }

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

        return accountRepository.findByField("email",email);
    }
    @Override
    public List<Account> findByUsername(String username) {

        return accountRepository.findByField("username",username);
    }


    @Override
    public boolean existsByUsername(String username) {
        return !accountRepository.findByField("username",username).isEmpty();
    }

    @Override
    public boolean existsByEmail(String email) {

        return !accountRepository.findByField("email",email).isEmpty();
    }
    @Override
    public Optional<Account> findById(Integer id) {

        return accountRepository.findById(id);
    }

    @Override


    public List<Account> findAll() {
        return accountRepository.findAll();
    }



    @Override
    public boolean deleteAccount(String name) {
        List<Account> accounts = accountRepository.findByField("username", name);
        if (!accounts.isEmpty()) {
            accountRepository.deleteByName(name);
            return true;
        }
        return false;

    }

    @Override
    public boolean deleteAccountById(Integer id) {
        Optional<Account> accountOpt = accountRepository.findById(id);
        if (accountOpt.isPresent()) {
            accountRepository.delete(accountOpt.get());
            return true;
        }
        return false;
    }

}