package swp391.fa25.swp391.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "ENTERPRISE_INVOICE")
public class EnterpriseInvoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ENT_INVOICE_ID", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ENTERPRISE_ID", nullable = false)
    private Enterprise enterprise;

    @Column(name = "BILLING_PERIOD_START", nullable = false)
    private LocalDate billingPeriodStart;

    @Column(name = "BILLING_PERIOD_END", nullable = false)
    private LocalDate billingPeriodEnd;

    @Column(name = "TOTAL_AMOUNT", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalAmount;

    @Nationalized
    @ColumnDefault("'Due'")
    @Column(name = "STATUS", length = 50)
    private String status;

    @ColumnDefault("getdate()")
    @Column(name = "ISSUE_DATE")
    private LocalDate issueDate;

    @OneToMany(
            mappedBy = "enterpriseInvoice", // "enterpriseInvoice" là tên trường trong class EnterpriseInvoiceDetail
            cascade = CascadeType.ALL,      // Nếu xóa Hóa đơn, các chi tiết cũng bị xóa
            fetch = FetchType.LAZY          // Giữ LAZY, EntityGraph sẽ override khi cần
    )
    private List<EnterpriseInvoiceDetail> enterpriseInvoiceDetails = new ArrayList<>();
}