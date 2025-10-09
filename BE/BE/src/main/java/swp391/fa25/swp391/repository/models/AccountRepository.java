package swp391.fa25.swp391.repository.models;

import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.Account;
import swp391.fa25.swp391.repository.GenericRepositoryImpl;

@Repository
public class AccountRepository extends GenericRepositoryImpl<Account> {
    public AccountRepository() {
        super(Account.class);
    }

}