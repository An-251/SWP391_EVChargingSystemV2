package swp391.fa25.swp391.repository.models;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.Driver;

import java.util.Optional;
import java.util.List;

/**
 * Repository cho Driver
 * Kế thừa JpaRepository để sử dụng các phương thức chuẩn của Spring Data JPA.
 * ID của Driver là Integer (giả định)
 */
@Repository
public interface DriverRepository extends JpaRepository<Driver, Integer> {


     Optional<Driver> findById(Integer accountId);

}