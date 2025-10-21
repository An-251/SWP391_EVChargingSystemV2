package swp391.fa25.swp391.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.Admin;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Integer> {

    // Tìm admin theo account_id
    Optional<Admin> findByAccountId(Integer accountId);

    // Kiểm tra tồn tại admin theo account_id
    boolean existsByAccountId(Integer accountId);
}