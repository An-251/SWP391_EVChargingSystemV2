package swp391.fa25.swp391.repository.models;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import swp391.fa25.swp391.entity.StationEmployee;
import swp391.fa25.swp391.entity.Account;

import java.util.List;
import java.util.Optional;

@Repository
public interface StationEmployeeRepository extends JpaRepository<StationEmployee, Integer> {

    /**
     * Tìm StationEmployee theo Account
     */
    Optional<StationEmployee> findByAccount(Account account);

    /**
     * Tìm StationEmployee theo Account ID
     */
    Optional<StationEmployee> findByAccount_Id(Integer accountId);

    /**
     * Tìm tất cả StationEmployee theo Position
     * VD: "Manager", "Technician", "Customer Service"
     */
    List<StationEmployee> findByPosition(String position);

    /**
     * Tìm StationEmployee theo Position chứa keyword
     */
    List<StationEmployee> findByPositionContaining(String keyword);

    /**
     * Kiểm tra xem Account đã là StationEmployee chưa
     */
    boolean existsByAccount_Id(Integer accountId);

    /**
     * Kiểm tra xem có employee nào ở position này không
     */
    boolean existsByPosition(String position);

    /**
     * Tìm tất cả employee, sắp xếp theo position
     */
    List<StationEmployee> findAllByOrderByPositionAsc();

    /**
     * Custom query: Tìm employee theo username của account
     */
    @Query("SELECT se FROM StationEmployee se WHERE se.account.username = :username")
    Optional<StationEmployee> findByAccountUsername(@Param("username") String username);

    /**
     * Custom query: Tìm employee theo email của account
     */
    @Query("SELECT se FROM StationEmployee se WHERE se.account.email = :email")
    Optional<StationEmployee> findByAccountEmail(@Param("email") String email);

    /**
     * Custom query: Tìm tất cả employee có account active
     */
    @Query("SELECT se FROM StationEmployee se WHERE se.account.status = :status")
    List<StationEmployee> findByAccountStatus(@Param("status") String status);

    /**
     * Custom query: Tìm employee theo position và account status
     */
    @Query("SELECT se FROM StationEmployee se " +
            "WHERE se.position = :position " +
            "AND se.account.status = :status")
    List<StationEmployee> findByPositionAndAccountStatus(
            @Param("position") String position,
            @Param("status") String status
    );

    /**
     * Custom query: Tìm tất cả employees với thông tin account
     * (Useful for admin dashboard)
     */
    @Query("SELECT se FROM StationEmployee se " +
            "JOIN FETCH se.account a " +
            "ORDER BY se.position ASC, a.username ASC")
    List<StationEmployee> findAllWithAccountDetails();

    /**
     * Custom query: Đếm số lượng employee theo account status
     */
    @Query("SELECT COUNT(se) FROM StationEmployee se WHERE se.account.status = :status")
    Long countByAccountStatus(@Param("status") String status);


}