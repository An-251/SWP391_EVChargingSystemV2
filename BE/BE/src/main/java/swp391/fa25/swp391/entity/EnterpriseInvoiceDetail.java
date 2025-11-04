package swp391.fa25.swp391.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Class này lưu trữ dòng chi tiết tổng hợp cho TỪNG XE
 * trên một Hóa đơn Doanh nghiệp (EnterpriseInvoice).
 * Mỗi dòng tương ứng với tổng chi phí của 1 xe trong kỳ.
 */
@Entity
@Table(name = "ENTERPRISE_INVOICE_DETAIL")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnterpriseInvoiceDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ENT_INVOICE_DETAIL_ID")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ENT_INVOICE_ID", nullable = false)
    private EnterpriseInvoice enterpriseInvoice; // Liên kết tới Hóa đơn tổng

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "VEHICLE_ID", nullable = false)
    private Vehicle vehicle; // Liên kết tới Xe được tính phí

    @Column(name = "TOTAL_SESSIONS", nullable = false)
    private Integer totalSessions; // Tổng số phiên sạc của xe này

    @Column(name = "TOTAL_KWH_USED", precision = 18, scale = 2)
    private BigDecimal totalKwhUsed; // Tổng kWh tiêu thụ

    @Column(name = "TOTAL_COST", precision = 18, scale = 2)
    private BigDecimal totalCost; // Tổng chi phí
}
