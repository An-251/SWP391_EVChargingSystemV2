package swp391.fa25.swp391.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.Driver;
import java.util.List;
import java.util.Optional;

/**
 * Repository cho Driver
 * Kế thừa JpaRepository để sử dụng các phương thức chuẩn của Spring Data JPA.
 * ID của Driver là Integer (giả định)
 */
@Repository
public interface DriverRepository extends JpaRepository<Driver, Integer> {
     Optional<Driver> findById(Integer accountId);
    Optional<Driver> findByAccountUsername(String username);
    /**
     * ⭐ Lấy tất cả driver có active plan
     */
    @Query("SELECT DISTINCT d FROM Driver d " +
            "JOIN d.planRegistrations pr " +
            "WHERE pr.status = 'ACTIVE'")
    List<Driver> findAllWithActivePlan();
}