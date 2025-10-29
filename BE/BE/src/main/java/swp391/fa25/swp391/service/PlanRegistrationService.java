package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.dto.request.PlanRegistrationRequest;
import swp391.fa25.swp391.dto.response.PlanRegistrationResponse;
import swp391.fa25.swp391.dto.response.VerifyQRCodeResponse;
import swp391.fa25.swp391.entity.Driver;
import swp391.fa25.swp391.entity.PlanRegistration;
import swp391.fa25.swp391.entity.SubscriptionPlan;
import swp391.fa25.swp391.repository.DriverRepository;
import swp391.fa25.swp391.repository.PlanRegistrationRepository;
import swp391.fa25.swp391.repository.SubscriptionPlanRepository;
import swp391.fa25.swp391.dto.response.PlanRegistrationResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlanRegistrationService {

    private final PlanRegistrationRepository registrationRepository;
    private final SubscriptionPlanRepository planRepository;
    private final DriverRepository driverRepository;
    private final SubscriptionQRCodeService qrCodeService; // Inject service mới

    /**
     * ⭐ [PHASE 1] Đăng ký gói (Tạo PENDING record)
     */
    @Transactional
    public PlanRegistrationResponse registerPlan(PlanRegistrationRequest request) {
        log.info("📝 [Phase 1] Registering plan {} for driver {}", request.getPlanId(), request.getDriverId());

        Driver driver = driverRepository.findById(request.getDriverId())
                .orElseThrow(() -> new RuntimeException("Driver not found: " + request.getDriverId()));

        SubscriptionPlan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new RuntimeException("Plan not found: " + request.getPlanId()));

        // Check nếu driver đã có gói PENDING hoặc ACTIVE (dùng hàm trong Repo bạn đã viết)
        if (registrationRepository.existsByDriverIdAndStatusIn(
                request.getDriverId(), List.of("PENDING", "ACTIVE"))) {
            throw new RuntimeException("Driver already has an active or pending subscription.");
        }

        PlanRegistration registration = new PlanRegistration();
        registration.setDriver(driver);
        registration.setPlan(plan);
        registration.setPaymentMethod(request.getPaymentMethod());
        registration.setTotalAmount(plan.getPrice()); // Lấy giá từ Plan

        // @PrePersist trong Entity sẽ tự set status = PENDING, paymentStatus = PENDING

        PlanRegistration saved = registrationRepository.save(registration);
        log.info("✅ [Phase 1] Created registration {} with status PENDING", saved.getId());

        // TODO: Chỗ này gọi PaymentService (VNPAY/MoMo) để tạo link thanh toán
        // và trả link đó về cho frontend

        return PlanRegistrationResponse.fromEntity(saved); // Dùng DTO Response bạn đã viết
    }

    /**
     * ⭐ [PHASE 2] Kích hoạt subscription (Sau khi callback thanh toán thành công)
     */
    @Transactional
    public PlanRegistration activateSubscription(Integer registrationId, String transactionId, String paymentMethod) {
        log.info("🔓 [Phase 2] Activating subscription {}", registrationId);

        PlanRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found: " + registrationId));

        if (registration.isPaid()) {
            log.warn("Subscription {} is already paid/activated.", registrationId);
            return registration;
        }

        // Kích hoạt (dùng helper method trong entity bạn đã viết)
        registration.activate();
        registration.setPaymentTransactionId(transactionId);
        registration.setPaymentMethod(paymentMethod);

        // ⭐ TẠO QR CODE
        String qrCode = qrCodeService.generateQRCodeForSubscription(registration);
        registration.setQrCode(qrCode);
        registration.setQrGeneratedAt(java.time.Instant.now());

        PlanRegistration activated = registrationRepository.save(registration);
        log.info("✅ [Phase 2] Activated subscription {} with QR: {}", registrationId, qrCode);

        return activated;
    }

    /**
     * ⭐ [PHASE 3] Xác thực QR Code khi sạc
     */
    @Transactional
    public VerifyQRCodeResponse verifySubscriptionByQRCode(String qrCode) {
        log.info("🔍 [Phase 3] Verifying QR code: {}", qrCode);

        SubscriptionQRCodeService.QRCodeInfo qrInfo;
        try {
            // 1. Parse QR để lấy registrationId
            qrInfo = qrCodeService.parseSubscriptionQRCode(qrCode);
        } catch (Exception e) {
            log.warn("Invalid QR format: {}", e.getMessage());
            return VerifyQRCodeResponse.invalid("Mã QR không hợp lệ");
        }

        // 2. Lấy registration từ DB
        Integer regId = Integer.parseInt(qrInfo.getRegistrationId());
        PlanRegistration registration = registrationRepository.findById(regId)
                .orElse(null);

        // 3. Kiểm tra DB record
        if (registration == null) {
            log.warn("Registration not found for ID: {}", regId);
            return VerifyQRCodeResponse.invalid("Đăng ký không tồn tại");
        }

        // 4. Kiểm tra status
        if (!"ACTIVE".equals(registration.getStatus())) {
            log.warn("Subscription {} is not ACTIVE (status: {})", regId, registration.getStatus());
            return VerifyQRCodeResponse.invalid("Gói đăng ký không hoạt động");
        }

        // 5. Kiểm tra hết hạn (dùng helper method trong entity bạn đã viết)
        if (registration.isExpired()) {
            log.warn("Subscription {} is expired (End date: {})", regId, registration.getEndDate());
            return VerifyQRCodeResponse.invalid("Gói đăng ký đã hết hạn");
        }

        // 6. Xác thực chữ ký (Quan trọng nhất!)
        String driverId = registration.getDriver().getId().toString();
        boolean isSignatureValid = qrCodeService.verifySubscriptionQRCode(
                qrCode,
                qrInfo.getRegistrationId(),
                driverId
        );

        if (!isSignatureValid) {
            log.error("CRITICAL: Invalid QR Signature for registration {}", regId);
            return VerifyQRCodeResponse.invalid("Mã QR không hợp lệ (Chữ ký sai)");
        }

        // 7. Ghi nhận lượt quét (dùng helper method trong entity)
        registration.incrementScanCount();
        registrationRepository.save(registration);

        log.info("✅ [Phase 3] QR Verified. RegID: {}, Driver: {}, Plan: {}",
                regId, driverId, registration.getPlan().getPlanName());

        // Trả về thông tin thành công
        return VerifyQRCodeResponse.valid(
                registration.getId(),
                registration.getDriver().getId(),
                registration.getDriver().getAccount().getFullName(),
                registration.getPlan().getPlanName(),
                registration.getEndDate()
        );
    }

    // =================================================================
    // CÁC HÀM API MÀ CONTROLLER CỦA BẠN CẦN
    // =================================================================

    @Transactional(readOnly = true)
    public PlanRegistrationResponse getCurrentSubscription(Integer driverId) {
        log.info("🔍 Getting current subscription for driver {}", driverId);

        PlanRegistration registration = registrationRepository
                .findActiveByDriverId(driverId, LocalDate.now()) // Dùng hàm repo bạn đã viết
                .orElseThrow(() -> new RuntimeException("No active subscription found for driver"));

        return PlanRegistrationResponse.fromEntity(registration);
    }

    @Transactional
    public PlanRegistrationResponse cancelSubscription(Integer driverId) {
        log.info("❌ Cancelling subscription for driver {}", driverId);

        PlanRegistration registration = registrationRepository
                .findActiveByDriverId(driverId, LocalDate.now())
                .orElseThrow(() -> new RuntimeException("No active subscription to cancel"));

        registration.setStatus("CANCELLED");
        PlanRegistration cancelled = registrationRepository.save(registration);

        log.info("✅ Cancelled subscription {}", registration.getId());
        return PlanRegistrationResponse.fromEntity(cancelled);
    }

    @Transactional(readOnly = true)
    public List<PlanRegistrationResponse> getRegistrationHistory(Integer driverId) {
        log.info("📜 Getting registration history for driver {}", driverId);

        List<PlanRegistration> registrations = registrationRepository.findByDriverId(driverId);
        return registrations.stream()
                .map(PlanRegistrationResponse::fromEntity) // Dùng hàm static bạn đã viết
                .collect(Collectors.toList());
    }
}