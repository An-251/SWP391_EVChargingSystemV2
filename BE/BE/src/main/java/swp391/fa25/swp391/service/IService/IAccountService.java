package swp391.fa25.swp391.service.IService;

import swp391.fa25.swp391.entity.Account;

import java.util.List;
import java.util.Optional;

public interface IAccountService {
    Account register(Account account);
    boolean login(String username, String password);
    public Account updateAccount(Account account) ;

    List<Account> findByEmail(String email);
    List<Account> findByUsername(String username);
    Optional<Account> findById(Integer id);
    List<Account> findAll();
    boolean deleteAccount(String username);

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean deleteAccountById(Integer id);
    boolean existsByRole(String role);

}
