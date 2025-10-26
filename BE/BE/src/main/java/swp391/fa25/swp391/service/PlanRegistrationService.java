package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.dto.request.PlanRegistrationRequest;
import swp391.fa25.swp391.dto.response.PlanRegistrationResponse;
import swp391.fa25.swp391.entity.Driver;
import swp391.fa25.swp391.entity.PlanRegistration;
import swp391.fa25.swp391.entity.SubscriptionPlan;
import swp391.fa25.swp391.repository.PlanRegistrationRepository;
import swp391.fa25.swp391.repository.SubscriptionPlanRepository;
import swp391.fa25.swp391.repository.DriverRepository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlanRegistrationService {

    private final PlanRegistrationRepository registrationRepository;
    private final SubscriptionPlanRepository planRepository;
    private final DriverRepository driverRepository;
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    /**
     * ⭐ STEP 1: AUTO ASSIGN BASIC PLAN khi driver đăng ký
     * Gọi method này từ DriverService sau khi tạo driver
     */
    @Transactional
    public PlanRegistration assignBasicPlanToNewDriver(Driver driver) {
        log.info("Auto-assigning Basic plan to new driver {}", driver.getId());

        SubscriptionPlan basicPlan = planRepository.findByIsDefault(true)
                .orElseThrow(() -> new RuntimeException("Basic plan not found. Please create one first."));

        PlanRegistration registration = new PlanRegistration();
        registration.setDriver(driver);
        registration.setPlan(basicPlan);
        registration.setStartDate(LocalDate.now());
        registration.setEndDate(LocalDate.now().plusYears(100)); // Permanent
        registration.setStatus("ACTIVE");

        PlanRegistration saved = registrationRepository.save(registration);
        log.info("Assigned Basic plan to driver {}", driver.getId());

        return saved;
    }

    /**
     * ⭐ STEP 2: Driver đăng ký gói Premium/Gold/VIP
     */
    @Transactional
    public PlanRegistrationResponse registerPlan(PlanRegistrationRequest request) {
        log.info("Driver {} registering plan {}", request.getDriverId(), request.getPlanId());

        // 1. Validate driver & plan
        Driver driver = driverRepository.findById(request.getDriverId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài xế với ID: " + request.getDriverId()));

        SubscriptionPlan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy gói dịch vụ với ID: " + request.getPlanId()));

        // 2. Check current active plan
        Optional<PlanRegistration> existingActive = registrationRepository
                .findActiveByDriverId(request.getDriverId(), LocalDate.now());

        if (existingActive.isPresent()) {
            PlanRegistration current = existingActive.get();

            // Nếu đang ở Basic → cho phép upgrade
            if (Boolean.TRUE.equals(current.getPlan().getIsDefault())) {
                current.setStatus("CANCELLED");
                current.setEndDate(LocalDate.now());
                registrationRepository.save(current);
                log.info("Cancelled Basic plan for driver {}", driver.getId());
            } else {
                throw new RuntimeException("Bạn đang có gói " + current.getPlan().getPlanName() +
                        " đang hoạt động. Vui lòng hủy trước khi đăng ký gói mới.");
            }
        }

        // 3. Tính ngày bắt đầu và kết thúc
        LocalDate startDate = LocalDate.now();
        int validityDays = Integer.parseInt(plan.getValidityDays());
        LocalDate endDate = startDate.plusDays(validityDays);

        // 4. Tạo registration mới
        PlanRegistration registration = new PlanRegistration();
        registration.setDriver(driver);
        registration.setPlan(plan);
        registration.setStartDate(startDate);
        registration.setEndDate(endDate);
        registration.setStatus("ACTIVE");

        PlanRegistration savedRegistration = registrationRepository.save(registration);
        log.info("Driver {} successfully registered plan {}", driver.getId(), plan.getPlanName());

        // 5. Return response
        return PlanRegistrationResponse.builder()
                .registrationId(savedRegistration.getId())
                .planName(plan.getPlanName())
                .startDate(startDate.format(dateFormatter))
                .endDate(endDate.format(dateFormatter))
                .status("ACTIVE")
                .totalPaid(plan.getPrice())
                .message("Đăng ký gói " + plan.getPlanName() + " thành công!")
                .build();
    }

    /**
     * ⭐ STEP 3: Hủy gói → TỰ ĐỘNG về Basic
     */
    @Transactional
    public PlanRegistrationResponse cancelSubscription(Integer driverId) {
        log.info("Cancelling subscription for driver {}", driverId);

        Optional<PlanRegistration> activeOpt = registrationRepository
                .findActiveByDriverId(driverId, LocalDate.now());

        if (activeOpt.isEmpty()) {
            throw new RuntimeException("Không tìm thấy gói nào đang hoạt động.");
        }

        PlanRegistration active = activeOpt.get();

        // Không cho hủy Basic
        if (Boolean.TRUE.equals(active.getPlan().getIsDefault())) {
            throw new RuntimeException("Không thể hủy gói Basic");
        }

        // Expire current plan
        active.setStatus("CANCELLED");
        active.setEndDate(LocalDate.now());
        registrationRepository.save(active);

        // Auto assign Basic plan trở lại
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        assignBasicPlanToNewDriver(driver);

        log.info("Cancelled plan and reverted driver {} to Basic", driverId);

        return PlanRegistrationResponse.builder()
                .registrationId(active.getId())
                .planName(active.getPlan().getPlanName())
                .status("CANCELLED")
                .message("Đã hủy gói dịch vụ. Tài khoản của bạn đã được chuyển về gói Basic.")
                .build();
    }

    /**
     * ⭐ STEP 4: Xem gói hiện tại
     */
    @Transactional(readOnly = true)
    public PlanRegistrationResponse getCurrentSubscription(Integer driverId) {
        Optional<PlanRegistration> activeOpt = registrationRepository
                .findActiveByDriverId(driverId, LocalDate.now());

        if (activeOpt.isEmpty()) {
            return PlanRegistrationResponse.builder()
                    .message("Bạn chưa đăng ký gói dịch vụ nào đang hoạt động.")
                    .build();
        }

        PlanRegistration active = activeOpt.get();
        return PlanRegistrationResponse.builder()
                .registrationId(active.getId())
                .planName(active.getPlan().getPlanName())
                .startDate(active.getStartDate().format(dateFormatter))
                .endDate(active.getEndDate().format(dateFormatter))
                .status(active.getStatus())
                .totalPaid(active.getPlan().getPrice())
                .message("Thông tin gói đang hoạt động.")
                .build();
    }

    /**
     * ⭐ STEP 5: Xem lịch sử
     */
    @Transactional(readOnly = true)
    public List<PlanRegistrationResponse> getRegistrationHistory(Integer driverId) {
        List<PlanRegistration> history = registrationRepository.findByDriverId(driverId);

        return history.stream()
                .map(reg -> PlanRegistrationResponse.builder()
                        .registrationId(reg.getId())
                        .planName(reg.getPlan().getPlanName())
                        .startDate(reg.getStartDate().format(dateFormatter))
                        .endDate(reg.getEndDate().format(dateFormatter))
                        .status(reg.getStatus())
                        .totalPaid(reg.getPlan().getPrice())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * ⭐ HELPER: Lấy active plan của driver (dùng cho session/invoice)
     */
    @Transactional(readOnly = true)
    public Optional<PlanRegistration> getActiveRegistration(Integer driverId) {
        return registrationRepository.findActiveByDriverId(driverId, LocalDate.now());
    }
}