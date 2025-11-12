package swp391.fa25.swp391.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "CASH_PAYMENT_REQUEST")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CashPaymentRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "REQUEST_ID")
    private Integer id;
    
    @Column(name = "REQUEST_TYPE", nullable = false, length = 50)
    private String requestType; // 'INVOICE' or 'SUBSCRIPTION'
    
    @Column(name = "REFERENCE_ID", nullable = false)
    private Integer referenceId; // Invoice ID or Subscription ID
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "DRIVER_ID", nullable = false)
    private Driver driver;
    
    @Column(name = "AMOUNT", nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;
    
    @Nationalized
    @Column(name = "PAYMENT_PROOF_URL", columnDefinition = "NVARCHAR(MAX)")
    private String paymentProofUrl;
    
    @Nationalized
    @Column(name = "NOTES", columnDefinition = "NVARCHAR(MAX)")
    private String notes;
    
    @Column(name = "STATUS", length = 50)
    private String status; // pending, approved, rejected, expired
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "FACILITY_ID")
    private Facility facility;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "EMPLOYEE_ID")
    private StationEmployee assignedEmployee;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "APPROVED_BY_EMPLOYEE_ID")
    private StationEmployee approvedByEmployee;
    
    @Column(name = "APPROVED_AT")
    private LocalDateTime approvedAt;
    
    @Nationalized
    @Column(name = "REJECTED_REASON", columnDefinition = "NVARCHAR(MAX)")
    private String rejectedReason;
    
    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;
    
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "pending";
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
