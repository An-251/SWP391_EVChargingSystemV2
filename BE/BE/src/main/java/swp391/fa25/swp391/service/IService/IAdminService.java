package swp391.fa25.swp391.service.IService;

import swp391.fa25.swp391.entity.Admin;

import java.util.List;

public interface IAdminService {
    List<Admin> findAllAccounts();
    Admin findByAccountId(Integer accountId);
    Admin findById(Integer accountId);
    void deleteAccount(Integer id);

}
