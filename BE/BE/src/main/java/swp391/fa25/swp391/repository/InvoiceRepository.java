package swp391.fa25.swp391.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import swp391.fa25.swp391.entity.Invoice;
import swp391.fa25.swp391.entity.Driver;
import swp391.fa25.swp391.entity.ChargingSession;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {

    /**
     * ⭐ Tìm invoice quá hạn chưa thanh toán
     */
    List<Invoice> findByStatusAndDueDateBefore(String status, Instant dueDate);
    /**
     * Tìm tất cả Invoice theo Driver ID
     */
    List<Invoice> findByDriver_Id(Integer driverId);

    /**
     * Tìm tất cả Invoice theo trạng thái (status)
     * VD: "PAID", "PENDING", "CANCELLED"
     */
    List<Invoice> findByStatus(String status);

    /**
     * Tìm Invoice theo Driver ID và status
     */
    List<Invoice> findByDriver_IdAndStatus(Integer driverId, String status);


    /**
     * Custom query: Tính tổng doanh thu theo status
     */
    @Query("SELECT SUM(i.totalCost) FROM Invoice i WHERE i.status = :status")
    BigDecimal getTotalRevenueByStatus(@Param("status") String status);

    /**
     * Custom query: Lấy Invoice của driver trong khoảng thời gian
     */
    @Query("SELECT i FROM Invoice i WHERE i.driver.id = :driverId " +
            "AND i.issueDate BETWEEN :startDate AND :endDate " +
            "ORDER BY i.issueDate DESC")
    List<Invoice> findDriverInvoicesByDateRange(
            @Param("driverId") Integer driverId,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );

    /**
     * Kiểm tra xem driver có invoice nào chưa thanh toán không
     */
    boolean existsByDriver_IdAndStatus(Integer driverId, String status);


    /**
     * Custom query: Tính tổng doanh thu của driver
     */
    @Query("SELECT SUM(i.totalCost) FROM Invoice i WHERE i.driver.id = :driverId AND i.status = :status")
    BigDecimal getTotalRevenueByDriverAndStatus(
            @Param("driverId") Integer driverId,
            @Param("status") String status
    );


}