
package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.entity.Invoice;
import swp391.fa25.swp391.repository.InvoiceRepository;
import swp391.fa25.swp391.service.IService.IInvoiceService;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceService implements IInvoiceService {

    private final InvoiceRepository invoiceRepository;

    @Override
    public Invoice save(Invoice invoice) {
        return invoiceRepository.save(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Invoice> findById(Integer id) {
        return invoiceRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Invoice> findAll() {
        return invoiceRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Invoice> findByDriverId(Integer driverId) {
        return invoiceRepository.findByDriver_Id(driverId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Invoice> findByStatus(String status) {
        return invoiceRepository.findByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Invoice> findByDriverIdAndStatus(Integer driverId, String status) {
        return invoiceRepository.findByDriver_IdAndStatus(driverId, status);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByDriverIdAndStatus(Integer driverId, String status) {
        return invoiceRepository.existsByDriver_IdAndStatus(driverId, status);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getTotalRevenueByStatus(String status) {
        BigDecimal result = invoiceRepository.getTotalRevenueByStatus(status);
        return result != null ? result : BigDecimal.ZERO;
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getTotalRevenueByDriverAndStatus(Integer driverId, String status) {
        BigDecimal result = invoiceRepository.getTotalRevenueByDriverAndStatus(driverId, status);
        return result != null ? result : BigDecimal.ZERO;
    }

    @Override
    public void deleteById(Integer id) {
        invoiceRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Invoice> findDriverInvoicesByDateRange(Integer driverId, Instant startDate, Instant endDate) {
        return invoiceRepository.findDriverInvoicesByDateRange(driverId, startDate, endDate);
    }
}
