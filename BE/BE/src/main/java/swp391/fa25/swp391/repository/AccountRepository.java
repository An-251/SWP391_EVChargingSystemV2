package swp391.fa25.swp391.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.Account;

import java.util.List;
import java.util.Optional;

/**
 * Repository cho Account
 * Sử dụng JpaRepository để tận dụng các phương thức tự động sinh (auto-generated methods)
 */
@Repository
public interface AccountRepository extends JpaRepository<Account, Integer> {

    /**
     * Tìm Account theo username để phục vụ đăng nhập/kiểm tra tồn tại
     */
    Optional<Account> findByUsername(String username);

    /**
     * Tìm Account theo email
     */
    Optional<Account> findByEmail(String email);

    /**
     * Tìm tất cả accounts theo username (vì login trong AccountService.java dùng List)
     */
    List<Account> findAllByUsername(String username);

    /**
     * Tìm tất cả accounts theo email (vì findByEmail trong AccountService.java dùng List)
     */
    List<Account> findAllByEmail(String email);

    /**
     * Kiểm tra Account có tồn tại theo username
     */
    boolean existsByUsername(String username);

    /**
     * Kiểm tra Account có tồn tại theo email
     */
    boolean existsByEmail(String email);


    /**
     * Xóa Account theo username
     * @return số lượng bản ghi đã xóa
     */
    Long deleteByUsername(String username);

    boolean existsByAccountRole(String role);
}