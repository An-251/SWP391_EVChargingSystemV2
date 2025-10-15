package swp391.fa25.swp391.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.entity.Account;
import swp391.fa25.swp391.service.IService.IAccountService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/accounts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminAccountController {

    private final IAccountService accountService;

    @GetMapping
    public ResponseEntity<List<Account>> getAllAccounts() {
        List<Account> accounts = accountService.findAll();
        return ResponseEntity.ok(accounts);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAccountByAdmin(@PathVariable Integer id, @RequestBody Account updatedAccount) {
        Optional<Account> existingAccountOpt = accountService.findById(id);
        if (existingAccountOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Account not found with ID: " + id);
        }

        Account accountToUpdate = existingAccountOpt.get();
        accountToUpdate.setEmail(updatedAccount.getEmail());
        accountToUpdate.setUsername(updatedAccount.getUsername());
        accountToUpdate.setPhone(updatedAccount.getPhone());
        accountToUpdate.setAccountRole(updatedAccount.getAccountRole());

        Account savedAccount = accountService.updateAccount(accountToUpdate);
        return ResponseEntity.ok(savedAccount);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAccount(@PathVariable Integer id) {
        boolean deleted = accountService.deleteAccountById(id);
        if (deleted) {
            return ResponseEntity.ok("Account with ID " + id + " deleted successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Account not found or could not be deleted.");
        }
    }
}