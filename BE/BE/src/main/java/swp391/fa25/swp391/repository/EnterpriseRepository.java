package swp391.fa25.swp391.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.Enterprise;

@Repository
public interface EnterpriseRepository extends JpaRepository<Enterprise, Integer> {
    // Các hàm findById, save, findAll... đã có sẵn
}
