package swp391.fa25.swp391.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.PlanRegistration;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PlanRegistrationRepository extends JpaRepository<PlanRegistration, Integer> {

    /**
     * ⭐ [PHƯƠNG THỨC BỊ THIẾU ĐÃ ĐƯỢC THÊM VÀO]
     * Dùng cho [Phase 1] registerPlan
     * Kiểm tra xem driver có gói PENDING hoặc ACTIVE không
     */
    boolean existsByDriverIdAndStatusIn(Integer driverId, List<String> statuses);

    /**
     * Tìm active subscription của driver
     */
    @Query("SELECT pr FROM PlanRegistration pr " +
            "WHERE pr.driver.id = :driverId " +
            "AND pr.status = 'ACTIVE' " +
            "AND :currentDate BETWEEN pr.startDate AND pr.endDate")
    Optional<PlanRegistration> findActiveByDriverId(
            @Param("driverId") Integer driverId,
            @Param("currentDate") LocalDate currentDate);

    /**
     * Tìm tất cả subscription của driver
     */
    List<PlanRegistration> findByDriverId(Integer driverId);

    /**
     * (Giữ lại từ file của bạn)
     */
    @Query("SELECT pr FROM PlanRegistration pr WHERE pr.driver.id = :driverId " +
            "AND pr.status = 'ACTIVE' " +
            "AND pr.startDate <= :date AND pr.endDate >= :date")
    Optional<PlanRegistration> findActivePlanAtDate(
            @Param("driverId") Integer driverId,
            @Param("date") LocalDate date
    );

    /**
     * (Giữ lại từ file của bạn)
     */
    @Query("SELECT pr FROM PlanRegistration pr WHERE pr.endDate < :today " +
            "AND pr.status = 'ACTIVE'")
    List<PlanRegistration> findExpiredPlans(@Param("today") LocalDate today);
}