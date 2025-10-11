package swp391.fa25.swp391.service;

import org.springframework.beans.factory.annotation.Autowired;
import swp391.fa25.swp391.entity.Account;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import swp391.fa25.swp391.repository.models.AccountRepository;
import swp391.fa25.swp391.service.IService.IAdminService;

import java.util.List;
import java.util.Optional;
@Service
@RequiredArgsConstructor
public class AdminService implements IAdminService {
    private final AccountRepository accountRepository;
    @Override
    public Optional<Account> findById(Integer id) {
        return accountRepository.findById(id);
    }
    @Override
    public List<Account> findAllAccounts() {
        return accountRepository.findAll();
    }
    @Override
    public void deleteAccount(Integer id) {
        accountRepository.deleteById(id);
    }


}
