package swp391.fa25.swp391.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;
import swp391.fa25.swp391.constants.PaymentStatus;
import swp391.fa25.swp391.entity.*;
import swp391.fa25.swp391.repository.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Mock VNPay Controller for DEMO/TESTING
 * Simulates VNPay payment gateway without actual redirect
 */
@Controller
@RequestMapping("/api/vnpay/mock")
@RequiredArgsConstructor
@Slf4j
public class MockVNPayController {

    private final InvoiceRepository invoiceRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final DriverRepository driverRepository;
    private final PlanRegistrationRepository planRegistrationRepository;

    /**
     * Mock payment gateway page - Auto approve after 2 seconds
     */
    @GetMapping("/payment")
    public String mockPaymentPage(
            @RequestParam String transactionId,
            @RequestParam Long amount,
            @RequestParam String orderInfo,
            @RequestParam String returnUrl,
            Model model
    ) {
        log.info("🎭 [MOCK VNPAY] Payment page accessed for transaction: {}", transactionId);
        
        try {
            String decodedOrderInfo = URLDecoder.decode(orderInfo, StandardCharsets.UTF_8.toString());
            String decodedReturnUrl = URLDecoder.decode(returnUrl, StandardCharsets.UTF_8.toString());
            
            model.addAttribute("transactionId", transactionId);
            model.addAttribute("amount", amount);
            model.addAttribute("orderInfo", decodedOrderInfo);
            model.addAttribute("returnUrl", decodedReturnUrl);
        } catch (Exception e) {
            log.error("Error decoding parameters", e);
        }
        
        return "mock-vnpay-payment";
    }

    /**
     * Mock payment callback - Called when user "completes" payment
     */
    @GetMapping("/callback-success")
    public RedirectView mockSuccessCallback(@RequestParam String transactionId) {
        try {
            log.info("💳 [MOCK VNPAY] Processing payment for transaction: {}", transactionId);

            // Parse transaction ID
            String[] parts = transactionId.split("_");
            String paymentType = parts[0];
            Integer referenceId = Integer.parseInt(parts[1]);

            if ("INVOICE".equals(paymentType)) {
                // Update invoice
                Invoice invoice = invoiceRepository.findById(referenceId)
                        .orElseThrow(() -> new RuntimeException("Invoice not found"));
                invoice.setStatus(PaymentStatus.INVOICE_PAID);
                invoice.setPaymentMethod(PaymentStatus.PAYMENT_METHOD_VNPAY);
                invoice.setPaidDate(LocalDateTime.now().toInstant(java.time.ZoneOffset.UTC));
                invoice.setPaymentReference("MOCK_VNPAY_" + System.currentTimeMillis());
                invoiceRepository.save(invoice);
                
                log.info("✅ [MOCK VNPAY] Invoice {} paid successfully", referenceId);

            } else if ("SUB".equals(paymentType)) {
                // Handle subscription payment
                SubscriptionPlan plan = subscriptionPlanRepository.findById(referenceId)
                        .orElseThrow(() -> new RuntimeException("Subscription plan not found"));
                
                Integer driverId = parts.length > 2 ? Integer.parseInt(parts[2]) : null;
                
                if (driverId != null) {
                    Driver driver = driverRepository.findById(driverId)
                            .orElseThrow(() -> new RuntimeException("Driver not found"));

                    // Cancel old subscriptions
                    List<PlanRegistration> activeSubscriptions = planRegistrationRepository
                            .findByDriverIdAndStatus(driverId, PaymentStatus.SUBSCRIPTION_ACTIVE);
                    
                    for (PlanRegistration oldSubscription : activeSubscriptions) {
                        oldSubscription.setStatus(PaymentStatus.SUBSCRIPTION_CANCELLED);
                        planRegistrationRepository.save(oldSubscription);
                        log.info("Cancelled old subscription {} for driver {}", 
                                oldSubscription.getId(), driverId);
                    }

                    // Calculate duration
                    int durationMonths = 1;
                    if (plan.getDurationMonths() != null && plan.getDurationMonths() > 0) {
                        durationMonths = plan.getDurationMonths();
                    } else if (plan.getValidityDays() != null) {
                        try {
                            int validityDays = Integer.parseInt(plan.getValidityDays());
                            durationMonths = Math.max(1, validityDays / 30);
                        } catch (NumberFormatException e) {
                            log.warn("Invalid validityDays format, using default 1 month");
                        }
                    }

                    // Create new subscription
                    PlanRegistration registration = new PlanRegistration();
                    registration.setDriver(driver);
                    registration.setPlan(plan);
                    registration.setStartDate(LocalDate.now());
                    registration.setEndDate(LocalDate.now().plusMonths(durationMonths));
                    registration.setStatus(PaymentStatus.SUBSCRIPTION_ACTIVE);
                    
                    planRegistrationRepository.save(registration);
                    
                    log.info("✅ [MOCK VNPAY] Subscription {} activated for driver {}", referenceId, driverId);
                }
            }

            // Redirect to frontend with success params
            String redirectUrl = String.format(
                "http://localhost:5173/payment/vnpay/callback?vnp_ResponseCode=00&vnp_TxnRef=%s&vnp_Message=Success",
                transactionId
            );
            
            return new RedirectView(redirectUrl);

        } catch (Exception e) {
            log.error("❌ [MOCK VNPAY] Error processing payment: {}", e.getMessage(), e);
            return new RedirectView("http://localhost:5173/payment/vnpay/callback?vnp_ResponseCode=99&vnp_Message=Error");
        }
    }
}
