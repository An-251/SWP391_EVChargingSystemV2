package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.constants.PaymentStatus;
import swp391.fa25.swp391.entity.*;
import swp391.fa25.swp391.repository.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CashPaymentRequestService {

    private final CashPaymentRequestRepository cashPaymentRequestRepository;
    private final DriverRepository driverRepository;
    private final FacilityRepository facilityRepository;
    private final StationEmployeeRepository stationEmployeeRepository;
    private final InvoiceRepository invoiceRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final PlanRegistrationRepository planRegistrationRepository;
    private final EmailService emailService;

    /**
     * Create a new cash payment request for invoice
     */
    @Transactional
    public CashPaymentRequest createInvoicePaymentRequest(Integer driverId, Integer invoiceId, Integer facilityId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new RuntimeException("Facility not found"));

        CashPaymentRequest request = new CashPaymentRequest();
        request.setRequestType("INVOICE");
        request.setReferenceId(invoiceId);
        request.setDriver(driver);
        request.setAmount(invoice.getTotalCost());
        request.setStatus(PaymentStatus.PAYMENT_REQUEST_PENDING);
        request.setFacility(facility);
        request.setNotes("Cash payment for invoice #" + invoiceId);

        return cashPaymentRequestRepository.save(request);
    }

    /**
     * Create a new cash payment request for subscription
     */
    @Transactional
    public CashPaymentRequest createSubscriptionPaymentRequest(Integer driverId, Integer subscriptionPlanId, Integer facilityId, BigDecimal amount) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        
        SubscriptionPlan subscriptionPlan = subscriptionPlanRepository.findById(subscriptionPlanId)
                .orElseThrow(() -> new RuntimeException("Subscription plan not found"));
        
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new RuntimeException("Facility not found"));

        CashPaymentRequest request = new CashPaymentRequest();
        request.setRequestType("SUBSCRIPTION");
        request.setReferenceId(subscriptionPlanId);
        request.setDriver(driver);
        request.setAmount(amount != null ? amount : subscriptionPlan.getPrice());
        request.setStatus(PaymentStatus.PAYMENT_REQUEST_PENDING);
        request.setFacility(facility);
        request.setNotes("Cash payment for subscription plan: " + subscriptionPlan.getPlanName());

        return cashPaymentRequestRepository.save(request);
    }

    /**
     * Get all pending requests for a facility
     */
    public List<CashPaymentRequest> getPendingRequestsByFacility(Integer facilityId) {
        return cashPaymentRequestRepository.findByFacilityIdAndStatus(facilityId, PaymentStatus.PAYMENT_REQUEST_PENDING);
    }

    /**
     * Get all requests for a facility (all statuses)
     */
    public List<CashPaymentRequest> getAllRequestsByFacility(Integer facilityId) {
        return cashPaymentRequestRepository.findByFacilityId(facilityId);
    }

    /**
     * Get all requests by driver
     */
    public List<CashPaymentRequest> getRequestsByDriver(Integer driverId) {
        return cashPaymentRequestRepository.findByDriverId(driverId);
    }

    /**
     * Approve a cash payment request
     */
    @Transactional
    public CashPaymentRequest approveRequest(Integer requestId, Integer employeeId, String approvalNotes) {
        CashPaymentRequest request = cashPaymentRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Payment request not found"));

        if (!PaymentStatus.PAYMENT_REQUEST_PENDING.equals(request.getStatus())) {
            throw new RuntimeException("Only pending requests can be approved");
        }

        StationEmployee employee = stationEmployeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        request.setStatus(PaymentStatus.PAYMENT_REQUEST_APPROVED);
        request.setApprovedByEmployee(employee);
        request.setApprovedAt(LocalDateTime.now());
        request.setRejectedReason(approvalNotes); // Store approval notes in rejectedReason field

        // Update the related invoice or subscription payment status
        if ("INVOICE".equals(request.getRequestType())) {
            Invoice invoice = invoiceRepository.findById(request.getReferenceId())
                    .orElseThrow(() -> new RuntimeException("Invoice not found"));
            invoice.setStatus(PaymentStatus.INVOICE_PAID);
            invoice.setPaymentMethod(PaymentStatus.PAYMENT_METHOD_CASH);
            invoice.setPaidDate(LocalDateTime.now().toInstant(java.time.ZoneOffset.UTC));
            invoiceRepository.save(invoice);
            
            // Send payment confirmation email
            String driverEmail = request.getDriver().getAccount().getEmail();
            if (driverEmail != null && !driverEmail.isEmpty()) {
                try {
                    emailService.sendInvoicePaymentConfirmationEmail(driverEmail, invoice, "CASH");
                    log.info("Sent invoice payment confirmation email to {}", driverEmail);
                } catch (Exception e) {
                    log.error("Failed to send invoice payment email: {}", e.getMessage());
                }
            }
            
        } else if ("SUBSCRIPTION".equals(request.getRequestType())) {
            // STEP 1: Cancel all active subscriptions for this driver
            List<PlanRegistration> activeSubscriptions = planRegistrationRepository
                    .findByDriverIdAndStatus(request.getDriver().getId(), PaymentStatus.SUBSCRIPTION_ACTIVE);
            
            for (PlanRegistration oldSubscription : activeSubscriptions) {
                oldSubscription.setStatus(PaymentStatus.SUBSCRIPTION_CANCELLED);
                planRegistrationRepository.save(oldSubscription);
            }
            
            // STEP 2: Create new subscription plan registration
            SubscriptionPlan subscriptionPlan = subscriptionPlanRepository.findById(request.getReferenceId())
                    .orElseThrow(() -> new RuntimeException("Subscription plan not found"));
            
            // Calculate duration: use durationMonths if available, otherwise convert validityDays to months
            int durationMonths = 1; // Default 1 month
            if (subscriptionPlan.getDurationMonths() != null && subscriptionPlan.getDurationMonths() > 0) {
                durationMonths = subscriptionPlan.getDurationMonths();
            } else if (subscriptionPlan.getValidityDays() != null) {
                try {
                    int validityDays = Integer.parseInt(subscriptionPlan.getValidityDays());
                    durationMonths = Math.max(1, validityDays / 30); // Convert days to months (30 days = 1 month)
                } catch (NumberFormatException e) {
                    // Keep default 1 month
                }
            }
            
            PlanRegistration registration = new PlanRegistration();
            registration.setDriver(request.getDriver());
            registration.setPlan(subscriptionPlan);
            registration.setStartDate(LocalDate.now());
            registration.setEndDate(LocalDate.now().plusMonths(durationMonths));
            registration.setStatus(PaymentStatus.SUBSCRIPTION_ACTIVE);
            
            planRegistrationRepository.save(registration);
            
            // Send subscription payment confirmation email
            String driverEmail = request.getDriver().getAccount().getEmail();
            if (driverEmail != null && !driverEmail.isEmpty()) {
                try {
                    emailService.sendSubscriptionPaymentEmail(driverEmail, registration, "CASH");
                    log.info("Sent subscription payment confirmation email to {}", driverEmail);
                } catch (Exception e) {
                    log.error("Failed to send subscription payment email: {}", e.getMessage());
                }
            }
        }

        return cashPaymentRequestRepository.save(request);
    }

    /**
     * Reject a cash payment request
     */
    @Transactional
    public CashPaymentRequest rejectRequest(Integer requestId, Integer employeeId, String rejectionReason) {
        CashPaymentRequest request = cashPaymentRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Payment request not found"));

        if (!PaymentStatus.PAYMENT_REQUEST_PENDING.equals(request.getStatus())) {
            throw new RuntimeException("Only pending requests can be rejected");
        }

        StationEmployee employee = stationEmployeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        request.setStatus(PaymentStatus.PAYMENT_REQUEST_REJECTED);
        request.setApprovedByEmployee(employee);
        request.setApprovedAt(LocalDateTime.now());
        request.setRejectedReason(rejectionReason);

        return cashPaymentRequestRepository.save(request);
    }

    /**
     * Get request by ID
     */
    public CashPaymentRequest getRequestById(Integer requestId) {
        return cashPaymentRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Payment request not found"));
    }
}
