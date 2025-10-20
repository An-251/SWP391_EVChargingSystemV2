package swp391.fa25.swp391.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;
import java.math.BigDecimal;

/**
 * Entity lưu các lợi ích cụ thể của từng gói subscription
 */
@Entity
@Table(name = "PLAN_BENEFIT")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanBenefit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BENEFIT_ID")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "PLAN_ID", nullable = false)
    private SubscriptionPlan subscriptionPlan;

    /**
     * Loại lợi ích (3 loại chính):
     * - CHARGING_DISCOUNT: Giảm giá phí sạc (%, VD: 15% off)
     * - SESSION_FEE_WAIVER: Miễn phí bắt đầu phiên (miễn hoàn toàn)
     * - OVERUSE_GRACE_TIME: Thời gian miễn phí trước khi tính phí overuse (phút, VD: 10 phút)
     */
    @Nationalized
    @Column(name = "BENEFIT_TYPE", length = 50, nullable = false)
    private String benefitType;

    /**
     * Giá trị lợi ích:
     * - CHARGING_DISCOUNT: % giảm giá (VD: 15 = giảm 15%)
     * - SESSION_FEE_WAIVER: 0 (flag, không cần giá trị)
     * - OVERUSE_GRACE_TIME: số phút (VD: 10 = 10 phút miễn phí)
     */
    @Column(name = "BENEFIT_VALUE", precision = 18, scale = 2)
    private BigDecimal benefitValue;

    /**
     * Đơn vị:
     * - PERCENTAGE: Phần trăm (cho discount)
     * - AMOUNT: Số tiền cố định
     * - MINUTES: Số phút (cho grace time)
     */
    @Nationalized
    @Column(name = "BENEFIT_UNIT", length = 20)
    private String benefitUnit;

    @Nationalized
    @Column(name = "DESCRIPTION", columnDefinition = "nvarchar(max)")
    private String description;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;
}