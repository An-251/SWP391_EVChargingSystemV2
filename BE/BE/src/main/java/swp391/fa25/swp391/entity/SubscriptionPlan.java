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

    @Column(name = "PRICE", precision = 18, scale = 2)
    private BigDecimal price;

    @Nationalized
    @Column(name = "VALIDITY_DAYS", length = 100)
    private String validityDays;

    @Nationalized
    @Column(name = "DESCRIPTION", columnDefinition = "nvarchar(max)")
    private String description;


    @Column(name = "IS_DEFAULT")
    private Boolean isDefault = false;


    @Column(name = "DISCOUNT_RATE", precision = 5, scale = 2)
    private BigDecimal discountRate; // VD: 10.00 = 10% discount

    @OneToMany(mappedBy = "plan")
    private List<PlanRegistration> planRegistrations = new ArrayList<>();

    @OneToMany(mappedBy = "subscriptionPlan", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<PlanBenefit> benefits = new ArrayList<>();
}