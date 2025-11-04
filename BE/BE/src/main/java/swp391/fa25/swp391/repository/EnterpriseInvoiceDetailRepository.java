package swp391.fa25.swp391.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.EnterpriseInvoiceDetail;

@Repository
public interface EnterpriseInvoiceDetailRepository extends JpaRepository<EnterpriseInvoiceDetail, Integer> {
    // Bạn có thể thêm các query tùy chỉnh ở đây nếu cần
}
