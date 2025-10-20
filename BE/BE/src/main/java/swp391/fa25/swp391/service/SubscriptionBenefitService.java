package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.entity.PlanBenefit;
import swp391.fa25.swp391.entity.PlanRegistration;
import swp391.fa25.swp391.repository.PlanRegistrationRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service xử lý logic tính toán 3 lợi ích chính từ subscription
 * Không dùng Constants class - hardcode string trực tiếp
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubscriptionBenefitService {

    private final PlanRegistrationRepository planRegistrationRepository;

    /**
     * Lấy active subscription của driver
     */
    public Optional<PlanRegistration> getActiveSubscription(Integer driverId) {
        LocalDate today = LocalDate.now();
        return planRegistrationRepository.findActiveByDriverId(driverId, today);
    }

    // ==================== PRIVATE HELPER METHODS ====================

    private boolean isChargingDiscount(PlanBenefit benefit) {
        return "CHARGING_DISCOUNT".equals(benefit.getBenefitType()) && benefit.getIsActive();
    }

    private boolean isSessionFeeWaiver(PlanBenefit benefit) {
        return "SESSION_FEE_WAIVER".equals(benefit.getBenefitType()) && benefit.getIsActive();
    }

    private boolean isOveruseGraceTime(PlanBenefit benefit) {
        return "OVERUSE_GRACE_TIME".equals(benefit.getBenefitType()) && benefit.getIsActive();
    }

    private boolean isPercentageUnit(PlanBenefit benefit) {
        return "PERCENTAGE".equals(benefit.getBenefitUnit());
    }

    // ==================== LỢI ÍCH 1: GIẢM GIÁ PHÍ SẠC ====================

    /**
     * Tính phí sạc sau khi áp dụng giảm giá từ subscription
     *
     * @param driverId ID của driver
     * @param originalChargingFee Phí sạc gốc
     * @return Phí sạc sau khi giảm
     */
    public BigDecimal calculateChargingFeeWithDiscount(Integer driverId, BigDecimal originalChargingFee) {
        Optional<PlanRegistration> activeSubOpt = getActiveSubscription(driverId);

        if (activeSubOpt.isEmpty()) {
            return originalChargingFee;
        }

        PlanRegistration activeSub = activeSubOpt.get();
        List<PlanBenefit> benefits = activeSub.getPlan().getBenefits();

        // Tìm benefit giảm giá sạc
        Optional<PlanBenefit> discountBenefit = benefits.stream()
                .filter(this::isChargingDiscount)
                .findFirst();

        if (discountBenefit.isEmpty()) {
            return originalChargingFee;
        }

        PlanBenefit benefit = discountBenefit.get();

        // Tính giảm giá theo phần trăm
        if (isPercentageUnit(benefit)) {
            BigDecimal discountPercent = benefit.getBenefitValue();
            BigDecimal discountAmount = originalChargingFee
                    .multiply(discountPercent)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            return originalChargingFee.subtract(discountAmount);
        }

        return originalChargingFee;
    }

    /**
     * Lấy % discount (để hiển thị cho user)
     */
    public BigDecimal getChargingDiscountPercentage(Integer driverId) {
        Optional<PlanRegistration> activeSubOpt = getActiveSubscription(driverId);

        if (activeSubOpt.isEmpty()) {
            return BigDecimal.ZERO;
        }

        PlanRegistration activeSub = activeSubOpt.get();
        List<PlanBenefit> benefits = activeSub.getPlan().getBenefits();

        Optional<PlanBenefit> discountBenefit = benefits.stream()
                .filter(this::isChargingDiscount)
                .findFirst();

        return discountBenefit.map(PlanBenefit::getBenefitValue).orElse(BigDecimal.ZERO);
    }

    // ==================== LỢI ÍCH 2: MIỄN PHÍ BẮT ĐẦU PHIÊN ====================

    /**
     * Tính phí bắt đầu phiên sau khi áp dụng miễn phí
     *
     * @param driverId ID của driver
     * @param sessionFee Phí bắt đầu phiên gốc
     * @return 0 nếu được miễn phí, giữ nguyên nếu không
     */
    public BigDecimal calculateSessionFeeWithWaiver(Integer driverId, BigDecimal sessionFee) {
        if (hasSessionFeeWaiver(driverId)) {
            return BigDecimal.ZERO;
        }
        return sessionFee;
    }

    /**
     * Kiểm tra driver có được miễn phí session fee không
     */
    public boolean hasSessionFeeWaiver(Integer driverId) {
        Optional<PlanRegistration> activeSubOpt = getActiveSubscription(driverId);

        if (activeSubOpt.isEmpty()) {
            return false;
        }

        PlanRegistration activeSub = activeSubOpt.get();
        List<PlanBenefit> benefits = activeSub.getPlan().getBenefits();

        return benefits.stream().anyMatch(this::isSessionFeeWaiver);
    }

    // ==================== LỢI ÍCH 3: THỜI GIAN MIỄN PHÍ TRƯỚC KHI TÍNH OVERUSE ====================

    /**
     * Lấy số phút grace time (miễn phí trước khi tính overuse fee)
     *
     * @param driverId ID của driver
     * @return Số phút grace time (0 nếu không có)
     */
    public int getOveruseGraceTimeMinutes(Integer driverId) {
        Optional<PlanRegistration> activeSubOpt = getActiveSubscription(driverId);

        if (activeSubOpt.isEmpty()) {
            return 0;
        }

        PlanRegistration activeSub = activeSubOpt.get();
        List<PlanBenefit> benefits = activeSub.getPlan().getBenefits();

        Optional<PlanBenefit> graceTime = benefits.stream()
                .filter(this::isOveruseGraceTime)
                .findFirst();

        return graceTime.map(b -> b.getBenefitValue().intValue()).orElse(0);
    }

    /**
     * Tính overuse fee sau khi trừ grace time
     *
     * @param driverId ID của driver
     * @param overuseMinutes Số phút overuse thực tế
     * @param overuseFeePerMinute Phí overuse mỗi phút
     * @return Phí overuse sau khi áp dụng grace time
     */
    public BigDecimal calculateOveruseFeeWithGraceTime(Integer driverId, int overuseMinutes, BigDecimal overuseFeePerMinute) {
        int graceTimeMinutes = getOveruseGraceTimeMinutes(driverId);

        // Số phút phải trả sau khi trừ grace time
        int chargeableMinutes = Math.max(0, overuseMinutes - graceTimeMinutes);

        return overuseFeePerMinute.multiply(BigDecimal.valueOf(chargeableMinutes));
    }

    // ==================== TỔNG HỢP THÔNG TIN LỢI ÍCH ====================

    /**
     * Lấy tất cả thông tin lợi ích của driver (để hiển thị trong profile/dashboard)
     */
    public SubscriptionBenefitInfo getDriverBenefitInfo(Integer driverId) {
        Optional<PlanRegistration> activeSubOpt = getActiveSubscription(driverId);

        if (activeSubOpt.isEmpty()) {
            return new SubscriptionBenefitInfo(false, null, null, false, 0);
        }

        PlanRegistration activeSub = activeSubOpt.get();

        return new SubscriptionBenefitInfo(
                true,
                activeSub.getPlan().getPlanName(),
                getChargingDiscountPercentage(driverId),
                hasSessionFeeWaiver(driverId),
                getOveruseGraceTimeMinutes(driverId)
        );
    }

    // Inner class để trả về thông tin benefit
    @lombok.Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class SubscriptionBenefitInfo {
        private boolean hasActiveSubscription;
        private String planName;
        private BigDecimal chargingDiscountPercentage;
        private boolean hasSessionFeeWaiver;
        private int overuseGraceTimeMinutes;
    }
}