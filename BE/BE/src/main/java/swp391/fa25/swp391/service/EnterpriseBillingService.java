package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.dto.request.enterprise.GenerateInvoiceRequest;
import swp391.fa25.swp391.entity.*;
import swp391.fa25.swp391.repository.*;
import swp391.fa25.swp391.service.IService.IEnterpriseBillingService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class EnterpriseBillingService implements IEnterpriseBillingService {

    private final EnterpriseRepository enterpriseRepository;
    private final EnterpriseInvoiceRepository enterpriseInvoiceRepository;
    private final EnterpriseInvoiceDetailRepository enterpriseInvoiceDetailRepository;
    private final VehicleRepository vehicleRepository;
    private final ChargingSessionRepository chargingSessionRepository;

    @Override
    public EnterpriseInvoice generateEnterpriseInvoice(GenerateInvoiceRequest request, Admin admin) {
        log.info("Admin {} generating invoice for enterprise {}", admin.getId(), request.getEnterpriseId());

        // 1. Tìm Enterprise
        Enterprise enterprise = enterpriseRepository.findById(request.getEnterpriseId())
                .orElseThrow(() -> new RuntimeException("Enterprise not found"));

        // 2. Tạo hóa đơn tổng (Draft)
        EnterpriseInvoice invoice = new EnterpriseInvoice();
        invoice.setEnterprise(enterprise);
        invoice.setBillingPeriodStart(request.getBillingPeriodStart());
        invoice.setBillingPeriodEnd(request.getBillingPeriodEnd());
        invoice.setIssueDate(java.time.LocalDate.now());
        invoice.setStatus("Draft"); // Trạng thái ban đầu
        invoice.setTotalAmount(BigDecimal.ZERO); // Sẽ cập nhật sau

        EnterpriseInvoice savedInvoice = enterpriseInvoiceRepository.save(invoice);
        log.info("Created draft invoice {} for enterprise {}", savedInvoice.getId(), enterprise.getId());

        BigDecimal globalTotalAmount = BigDecimal.ZERO;

        // 3. Lấy tất cả xe của Enterprise
        List<Vehicle> vehicles = vehicleRepository.findByEnterpriseId(request.getEnterpriseId());
        log.info("Found {} vehicles for enterprise {}", vehicles.size(), enterprise.getId());

        // Điều chỉnh thời gian end date để bao gồm cả ngày
        LocalDateTime periodStart = request.getBillingPeriodStart().atStartOfDay();
        LocalDateTime periodEnd = request.getBillingPeriodEnd().atTime(LocalTime.MAX);

        // 4. LẶP QUA TỪNG XE để tổng hợp chi phí
        for (Vehicle vehicle : vehicles) {
            log.debug("Processing vehicle ID: {}", vehicle.getId());

            // 5. Tìm tất cả session của xe này TRONG KỲ và CHƯA CÓ HÓA ĐƠN
            List<ChargingSession> sessions = chargingSessionRepository
                    .findByVehicleIdAndStatusAndEndTimeBetweenAndEnterpriseInvoiceIsNull(
                            vehicle.getId(),
                            "completed",
                            periodStart,
                            periodEnd
                    );

            if (sessions.isEmpty()) {
                log.debug("No billable sessions found for vehicle {}", vehicle.getId());
                continue; // Bỏ qua xe này nếu không có phiên sạc
            }

            log.info("Found {} billable sessions for vehicle {}", sessions.size(), vehicle.getId());

            // 6. Tính toán tổng hợp cho xe này
            int vehicleTotalSessions = sessions.size();
            BigDecimal vehicleTotalKwh = BigDecimal.ZERO;
            BigDecimal vehicleTotalCost = BigDecimal.ZERO;

            for (ChargingSession session : sessions) {
                vehicleTotalKwh = vehicleTotalKwh.add(session.getKwhUsed());
                vehicleTotalCost = vehicleTotalCost.add(session.getCost());
            }

            // 7. Tạo dòng chi tiết hóa đơn (Invoice Detail)
            EnterpriseInvoiceDetail detail = EnterpriseInvoiceDetail.builder()
                    .enterpriseInvoice(savedInvoice)
                    .vehicle(vehicle)
                    .totalSessions(vehicleTotalSessions)
                    .totalKwhUsed(vehicleTotalKwh)
                    .totalCost(vehicleTotalCost)
                    .build();

            enterpriseInvoiceDetailRepository.save(detail);

            // 8. Cập nhật tổng tiền toàn cục
            globalTotalAmount = globalTotalAmount.add(vehicleTotalCost);

            // 9. RẤT QUAN TRỌNG: Gán hóa đơn vào các session đã xử lý
            for (ChargingSession session : sessions) {
                session.setEnterpriseInvoice(savedInvoice);
                chargingSessionRepository.save(session); // Cập nhật lại session
            }
        } // Hết vòng lặp các xe

        // 10. Cập nhật tổng tiền cuối cùng vào hóa đơn tổng
        savedInvoice.setTotalAmount(globalTotalAmount);
        EnterpriseInvoice finalInvoice = enterpriseInvoiceRepository.save(savedInvoice);

        log.info("Successfully generated invoice {}. Total Amount: {}", finalInvoice.getId(), finalInvoice.getTotalAmount());
        return finalInvoice;
    }

    @Override
    @Transactional(readOnly = true)
    public EnterpriseInvoice getEnterpriseInvoiceById(Integer invoiceId) {
        log.debug("Fetching invoice details for ID: {}", invoiceId);
        // Cần đảm bảo rằng khi lấy Hóa đơn, các chi tiết (details) cũng được load
        // Nếu dùng LAZY, bạn cần query riêng hoặc dùng @EntityGraph
        EnterpriseInvoice invoice = enterpriseInvoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // Khởi tạo collection (nếu là LAZY) để tránh lỗi
        // Cách đơn giản nhất:
        invoice.getEnterpriseInvoiceDetails().size();

        return invoice;
    }
}
