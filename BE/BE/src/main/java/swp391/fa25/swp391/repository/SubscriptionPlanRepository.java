package swp391.fa25.swp391.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import swp391.fa25.swp391.entity.SubscriptionPlan;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Integer> {

    /**
     * Tìm SubscriptionPlan theo tên chính xác
     */
    Optional<SubscriptionPlan> findByPlanName(String planName);

    /**
     * Tìm SubscriptionPlan theo tên (chứa keyword)
     */
    List<SubscriptionPlan> findByPlanNameContaining(String keyword);

    /**
     * Tìm tất cả SubscriptionPlan theo loại (plan_type)
     * VD: "MONTHLY", "YEARLY", "BASIC", "PREMIUM"
     */
    List<SubscriptionPlan> findByPlanType(String planType);

    /**
     * Tìm SubscriptionPlan có giá trong khoảng
     */
    List<SubscriptionPlan> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);

    /**
     * Tìm SubscriptionPlan theo validity days
     */
    List<SubscriptionPlan> findByValidityDays(String validityDays);

    /**
     * Tìm tất cả plans, sắp xếp theo giá tăng dần
     */
    List<SubscriptionPlan> findAllByOrderByPriceAsc();

    /**
     * Tìm tất cả plans, sắp xếp theo giá giảm dần
     */
    List<SubscriptionPlan> findAllByOrderByPriceDesc();

    /**
     * Tìm tất cả plans, sắp xếp theo tên
     */
    List<SubscriptionPlan> findAllByOrderByPlanNameAsc();

    /**
     * Kiểm tra xem plan name đã tồn tại chưa
     */
    boolean existsByPlanName(String planName);

    /**
     * Kiểm tra xem plan type đã có chưa
     */
    boolean existsByPlanType(String planType);

    /**
     * Đếm số lượng plan theo plan type
     */
    Long countByPlanType(String planType);

    /**
     * Custom query: Tìm các plan phổ biến (có nhiều registration)
     */
    @Query("SELECT sp FROM SubscriptionPlan sp " +
            "LEFT JOIN sp.planRegistrations pr " +
            "GROUP BY sp.id " +
            "ORDER BY COUNT(pr) DESC")
    List<SubscriptionPlan> findMostPopularPlans();

    /**
     * Custom query: Tìm plan theo khoảng giá và plan type
     */
    @Query("SELECT sp FROM SubscriptionPlan sp " +
            "WHERE sp.planType = :planType " +
            "AND sp.price BETWEEN :minPrice AND :maxPrice " +
            "ORDER BY sp.price ASC")
    List<SubscriptionPlan> findByPlanTypeAndPriceRange(
            @Param("planType") String planType,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice
    );

    /**
     * Custom query: Đếm số lượng registration của mỗi plan
     */
    @Query("SELECT sp.planName, COUNT(pr) FROM SubscriptionPlan sp " +
            "LEFT JOIN sp.planRegistrations pr " +
            "GROUP BY sp.id, sp.planName")
    List<Object[]> countRegistrationsByPlan();

    /**
     * Custom query: Tìm plan có active registrations
     */
    @Query("SELECT DISTINCT sp FROM SubscriptionPlan sp " +
            "JOIN sp.planRegistrations pr " +
            "WHERE pr.status = :status")
    List<SubscriptionPlan> findPlansWithActiveRegistrations(@Param("status") String status);

    /**
     * Custom query: Tìm plan chưa có registration nào
     */
    @Query("SELECT sp FROM SubscriptionPlan sp " +
            "WHERE sp.planRegistrations IS EMPTY")
    List<SubscriptionPlan> findPlansWithoutRegistrations();

}