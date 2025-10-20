package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
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

@Service
@RequiredArgsConstructor
public class PlanRegistrationService {

    private final PlanRegistrationRepository registrationRepository;
    private final SubscriptionPlanRepository planRepository;
    private final DriverRepository driverRepository;
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    /**
     * Xử lý logic đăng ký gói dịch vụ cho tài xế.
     */
    @Transactional
    public PlanRegistrationResponse registerPlan(PlanRegistrationRequest request) {
        // 1. Kiểm tra sự tồn tại của Driver và SubscriptionPlan
        Driver driver = driverRepository.findById(request.getDriverId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài xế với ID: " + request.getDriverId()));

        SubscriptionPlan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy gói dịch vụ với ID: " + request.getPlanId()));

        // 2. Kiểm tra xem tài xế đã có gói nào đang hoạt động chưa
        Optional<PlanRegistration> existingActive = registrationRepository
                .findActiveByDriverId(request.getDriverId(), LocalDate.now());

        if (existingActive.isPresent()) {
            throw new RuntimeException("Bạn đang có một gói đang hoạt động. Vui lòng hủy gói hiện tại trước khi đăng ký gói mới.");
        }

        // 3. Tính toán ngày bắt đầu và ngày kết thúc
        LocalDate startDate = LocalDate.now();
        int validityDays = Integer.parseInt(plan.getValidityDays());
        LocalDate endDate = startDate.plusDays(validityDays);

        // 4. Tạo đối tượng PlanRegistration mới và lưu vào database
        PlanRegistration registration = new PlanRegistration();
        registration.setDriver(driver);
        registration.setPlan(plan);
        registration.setStartDate(startDate);
        registration.setEndDate(endDate);
        registration.setStatus("ACTIVE"); // Mặc định là ACTIVE, có thể đổi thành PENDING nếu cần luồng thanh toán

        PlanRegistration savedRegistration = registrationRepository.save(registration);

        // 5. Xây dựng và trả về response cho client
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
     * Lấy thông tin gói dịch vụ đang hoạt động của tài xế.
     */
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
     * Hủy gói dịch vụ đang hoạt động của tài xế.
     */
    @Transactional
    public PlanRegistrationResponse cancelSubscription(Integer driverId) {
        Optional<PlanRegistration> activeOpt = registrationRepository
                .findActiveByDriverId(driverId, LocalDate.now());

        if (activeOpt.isEmpty()) {
            throw new RuntimeException("Không tìm thấy gói nào đang hoạt động để hủy.");
        }

        PlanRegistration active = activeOpt.get();
        active.setStatus("CANCELLED");
        active.setEndDate(LocalDate.now()); // Kết thúc gói ngay tại thời điểm hủy

        registrationRepository.save(active);

        return PlanRegistrationResponse.builder()
                .registrationId(active.getId())
                .planName(active.getPlan().getPlanName())
                .status("CANCELLED")
                .message("Đã hủy gói dịch vụ thành công.")
                .build();
    }

    /**
     * Lấy toàn bộ lịch sử đăng ký gói của tài xế.
     */
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
}
