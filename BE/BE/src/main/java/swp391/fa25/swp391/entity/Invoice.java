package swp391.fa25.swp391.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "INVOICE")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "INVOICE_ID", nullable = false)
    private Integer id;

    @Column(name = "ISSUE_DATE", nullable = false)
    private Instant issueDate;

    // ⭐ THÊM MỚI - Billing period
    @Column(name = "BILLING_START_DATE")
    private LocalDate billingStartDate;

    @Column(name = "BILLING_END_DATE")
    private LocalDate billingEndDate;

    @Column(name = "DUE_DATE")
    private Instant dueDate;

    @Column(name = "PAID_DATE")
    private Instant paidDate;

    @Column(name = "TOTAL_COST", precision = 15, scale = 2)
    private BigDecimal totalCost;

    @Nationalized
    @Column(name = "PAYMENT_METHOD", length = 100)
    private String paymentMethod;

    @Nationalized
    @Column(name = "STATUS", length = 50)
    private String status; // UNPAID, PAID, OVERDUE


    @Nationalized
    @Column(name = "QR_CODE", length = 500)
    private String qrCode;

    @Nationalized
    @Column(name = "PAYMENT_REFERENCE", length = 100)
    private String paymentReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "DRIVER_ID", nullable = false)
    @JsonIgnoreProperties({"vehicles", "account", "chargingSessions", "invoices", "planRegistrations"})
    private Driver driver;

    @OneToMany(mappedBy = "invoice", fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"invoice", "driver"})
    private List<ChargingSession> sessions = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PLAN_ID")
    @JsonIgnoreProperties({"planRegistrations"})
    private SubscriptionPlan planAtBilling;
}