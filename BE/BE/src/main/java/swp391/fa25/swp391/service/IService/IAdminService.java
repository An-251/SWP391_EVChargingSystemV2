package swp391.fa25.swp391.service.IService;

import swp391.fa25.swp391.entity.Account;

import java.util.List;
import java.util.Optional;

public interface IAdminService {
    List<Account> findAllAccounts();
    Optional<Account> findById(Integer id);

    void deleteAccount(Integer id);

}
