package swp391.fa25.swp391.service.IService;

import swp391.fa25.swp391.entity.Invoice;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface IInvoiceService {
    Invoice save(Invoice invoice);

    Optional<Invoice> findById(Integer id);

    List<Invoice> findAll();

    List<Invoice> findByDriverId(Integer driverId);

    List<Invoice> findByStatus(String status);

    List<Invoice> findByDriverIdAndStatus(Integer driverId, String status);

    boolean existsByDriverIdAndStatus(Integer driverId, String status);

    BigDecimal getTotalRevenueByStatus(String status);

    BigDecimal getTotalRevenueByDriverAndStatus(Integer driverId, String status);

    void deleteById(Integer id);

    List<Invoice> findDriverInvoicesByDateRange(Integer driverId, Instant startDate, Instant endDate);
}
