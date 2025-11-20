package swp391.fa25.swp391.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "SUBSCRIPTION_PLAN")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PLAN_ID")
    private Integer id;

    @Nationalized
    @Column(name = "PLAN_NAME")
    private String planName;

    @Nationalized
    @Column(name = "PLAN_TYPE", length = 100)
    private String planType;

    @Nationalized
    @Column(name = "TARGET_USER_TYPE", length = 50)
    private String targetUserType; // "Driver" or "Enterprise"

    @Column(name = "PRICE", precision = 18, scale = 2)
    private BigDecimal price;

    @Nationalized
    @Column(name = "VALIDITY_DAYS", length = 100)
    private String validityDays;

    @Column(name = "DURATION_MONTHS")
    private Integer durationMonths; // Duration in months for subscription

    @Nationalized
    @Column(name = "DESCRIPTION", columnDefinition = "nvarchar(max)")
    private String description;


    @Column(name = "IS_DEFAULT")
    private Boolean isDefault = false;


    @Column(name = "DISCOUNT_RATE", precision = 5, scale = 2)
    private BigDecimal discountRate; // VD: 10.00 = 10% discount

    @Column(name = "IS_DELETED")
    private Boolean isDeleted = false;

    @Column(name = "DELETED_AT")
    private java.time.Instant deletedAt;

    @Nationalized
    @Column(name = "DELETED_BY", length = 255)
    private String deletedBy;

    @OneToMany(mappedBy = "plan")
    private List<PlanRegistration> planRegistrations = new ArrayList<>();


}