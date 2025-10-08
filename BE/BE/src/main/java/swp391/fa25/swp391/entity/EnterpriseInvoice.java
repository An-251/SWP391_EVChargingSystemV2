package swp391.fa25.swp391.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;
import java.time.LocalDate;

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

}