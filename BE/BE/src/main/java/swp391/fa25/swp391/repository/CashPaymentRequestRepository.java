package swp391.fa25.swp391.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.CashPaymentRequest;

import java.util.List;

@Repository
public interface CashPaymentRequestRepository extends JpaRepository<CashPaymentRequest, Integer> {
    
    /**
     * Find all cash payment requests for a specific facility
     */
    List<CashPaymentRequest> findByFacilityId(Integer facilityId);
    
    /**
     * Find all pending requests for a specific facility
     */
    List<CashPaymentRequest> findByFacilityIdAndStatus(Integer facilityId, String status);
    
    /**
     * Find all requests by driver
     */
    List<CashPaymentRequest> findByDriverId(Integer driverId);
    
    /**
     * Find all requests assigned to a specific employee
     */
    List<CashPaymentRequest> findByAssignedEmployeeId(Integer employeeId);
    
    /**
     * Find all requests by status
     */
    List<CashPaymentRequest> findByStatus(String status);
}
