package swp391.fa25.swp391.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.constants.PaymentStatus;
import swp391.fa25.swp391.dto.request.VNPayPaymentRequest;
import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.dto.response.VNPayPaymentResponse;
import swp391.fa25.swp391.entity.*;
import swp391.fa25.swp391.repository.*;
import swp391.fa25.swp391.service.VNPayService;
import swp391.fa25.swp391.service.EmailService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vnpay")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class VNPayPaymentController {

    private final VNPayService vnPayService;
    private final InvoiceRepository invoiceRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final DriverRepository driverRepository;
    private final PlanRegistrationRepository planRegistrationRepository;
    private final EmailService emailService;

    /**
     * Create VNPay payment for subscription
     * POST /api/vnpay/subscription/create-payment
     */
    @PostMapping("/subscription/create-payment")
    public ResponseEntity<ApiResponse> createSubscriptionPayment(@RequestBody VNPayPaymentRequest request) {
        try {
            SubscriptionPlan plan = subscriptionPlanRepository.findById(request.getReferenceId())
                    .orElseThrow(() -> new RuntimeException("Subscription plan not found"));

            Driver driver = driverRepository.findById(request.getDriverId())
                    .orElseThrow(() -> new RuntimeException("Driver not found"));

            // Generate transaction ID with driver ID included
            String transactionId = "SUB_" + request.getReferenceId() + "_" + request.getDriverId() + "_" + System.currentTimeMillis();
            
            // Convert price to VND (assuming price is in USD, multiply by 24000, or use as-is if already VND)
            Long amountVND = request.getAmount() != null ? request.getAmount() : plan.getPrice().longValue();
            
            String orderInfo = "Thanh toan goi " + plan.getPlanName() + " - Driver: " + driver.getId();
            String returnUrl = request.getReturnUrl();

            // ⭐ OPTION 1: MOCK VNPAY (for quick local testing - NO REGISTRATION NEEDED)
            // Uncomment this block to use Mock VNPay:
            /*
            String paymentUrl = String.format(
                "http://localhost:8080/api/vnpay/mock/payment?transactionId=%s&amount=%d&orderInfo=%s&returnUrl=%s",
                transactionId, 
                amountVND,
                java.net.URLEncoder.encode(orderInfo, "UTF-8"),
                java.net.URLEncoder.encode(returnUrl != null ? returnUrl : "http://localhost:5173", "UTF-8")
            );
            */
            
            // ⭐ OPTION 2: REAL VNPAY (requires TMN Code & Hash Secret from sandbox.vnpayment.vn)
            // Comment this line if using Mock VNPay:
            String paymentUrl = vnPayService.createPaymentUrl(transactionId, amountVND, orderInfo, returnUrl);
            
            // 📝 TO SWITCH:
            // - Mock VNPay: Comment line above, uncomment Mock block
            // - Real VNPay: Uncomment line above, comment Mock block

            VNPayPaymentResponse response = VNPayPaymentResponse.builder()
                    .paymentUrl(paymentUrl)
                    .transactionId(transactionId)
                    .message("Payment URL generated successfully")
                    .success(true)
                    .build();

            return ResponseEntity.ok()
                    .body(ApiResponse.success("VNPay payment URL created", response));

        } catch (Exception e) {
            log.error("Error creating VNPay subscription payment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Error creating payment: " + e.getMessage()));
        }
    }

    /**
     * Create VNPay payment for invoice
     * POST /api/vnpay/invoice/create-payment
     */
    @PostMapping("/invoice/create-payment")
    public ResponseEntity<ApiResponse> createInvoicePayment(@RequestBody VNPayPaymentRequest request) {
        try {
            Invoice invoice = invoiceRepository.findById(request.getReferenceId())
                    .orElseThrow(() -> new RuntimeException("Invoice not found"));

            // Generate transaction ID
            String transactionId = "INVOICE_" + request.getReferenceId() + "_" + System.currentTimeMillis();
            
            Long amountVND = invoice.getTotalCost().longValue();
            String orderInfo = "Thanh toan hoa don #" + invoice.getId();
            String returnUrl = request.getReturnUrl();

            // ⭐ OPTION 1: MOCK VNPAY (for quick local testing - NO REGISTRATION NEEDED)
            // Uncomment this block to use Mock VNPay:
            /*
            String paymentUrl = String.format(
                "http://localhost:8080/api/vnpay/mock/payment?transactionId=%s&amount=%d&orderInfo=%s&returnUrl=%s",
                transactionId, 
                amountVND,
                java.net.URLEncoder.encode(orderInfo, "UTF-8"),
                java.net.URLEncoder.encode(returnUrl != null ? returnUrl : "http://localhost:5173", "UTF-8")
            );
            */
            
            // ⭐ OPTION 2: REAL VNPAY (requires TMN Code & Hash Secret from sandbox.vnpayment.vn)
            // Comment this line if using Mock VNPay:
            String paymentUrl = vnPayService.createPaymentUrl(transactionId, amountVND, orderInfo, returnUrl);
            
            // 📝 TO SWITCH:
            // - Mock VNPay: Comment line above, uncomment Mock block
            // - Real VNPay: Uncomment line above, comment Mock block

            VNPayPaymentResponse response = VNPayPaymentResponse.builder()
                    .paymentUrl(paymentUrl)
                    .transactionId(transactionId)
                    .message("Payment URL generated successfully")
                    .success(true)
                    .build();

            return ResponseEntity.ok()
                    .body(ApiResponse.success("VNPay payment URL created", response));

        } catch (Exception e) {
            log.error("Error creating VNPay invoice payment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Error creating payment: " + e.getMessage()));
        }
    }

    /**
     * Handle VNPay payment callback
     * GET /api/vnpay/callback
     */
    @GetMapping("/callback")
    @Transactional
    public ResponseEntity<ApiResponse> handleCallback(@RequestParam Map<String, String> params) {
        try {
            log.info("📥 Received VNPay callback with {} parameters", params.size());
            log.debug("Callback params: {}", params);

            // Validate signature
            boolean isValidSignature = vnPayService.validateCallback(params);
            if (!isValidSignature) {
                log.error("❌ Invalid VNPay callback signature");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Invalid payment signature"));
            }
            
            log.info("✅ Signature validated successfully");

            String responseCode = params.get("vnp_ResponseCode");
            String transactionId = params.get("vnp_TxnRef");
            String amount = params.get("vnp_Amount");
            
            log.info("💳 Transaction details: code={}, txnRef={}, amount={}", 
                    responseCode, transactionId, amount);

            // Parse transaction ID to get payment type and reference ID
            Map<String, String> txnData = vnPayService.parseTransactionId(transactionId);
            String paymentType = txnData.get("paymentType");
            Integer referenceId = Integer.parseInt(txnData.get("referenceId"));
            
            log.info("📋 Parsed transaction: type={}, refId={}", paymentType, referenceId);

            // Check if payment was successful
            if ("00".equals(responseCode)) {
                if ("INVOICE".equals(paymentType)) {
                    // Update invoice status
                    Invoice invoice = invoiceRepository.findById(referenceId)
                            .orElseThrow(() -> new RuntimeException("Invoice not found"));
                    invoice.setStatus(PaymentStatus.INVOICE_PAID);
                    invoice.setPaymentMethod(PaymentStatus.PAYMENT_METHOD_VNPAY);
                    invoice.setPaidDate(LocalDateTime.now().toInstant(java.time.ZoneOffset.UTC));
                    invoiceRepository.save(invoice);
                    
                    log.info("✅ Invoice {} paid successfully via VNPay", referenceId);

                    // ⭐ Send payment confirmation email
                    String driverEmail = invoice.getDriver().getAccount().getEmail();
                    if (driverEmail != null && !driverEmail.isEmpty()) {
                        try {
                            emailService.sendInvoicePaymentConfirmationEmail(driverEmail, invoice, "VNPAY");
                            log.info("✅ Sent invoice payment confirmation email to {}", driverEmail);
                        } catch (Exception e) {
                            log.error("❌ Failed to send invoice payment email: {}", e.getMessage());
                        }
                    }

                } else if ("SUB".equals(paymentType)) {
                    // Get driverId from parsed transaction data
                    Integer driverId = txnData.containsKey("driverId") 
                        ? Integer.parseInt(txnData.get("driverId")) 
                        : null;
                    
                    if (driverId == null) {
                        log.error("❌ Driver ID not found in transaction: {}", transactionId);
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.error("Invalid transaction format"));
                    }

                    // Get plan and driver
                    SubscriptionPlan plan = subscriptionPlanRepository.findById(referenceId)
                            .orElseThrow(() -> new RuntimeException("Subscription plan not found"));
                    Driver driver = driverRepository.findById(driverId)
                            .orElseThrow(() -> new RuntimeException("Driver not found"));

                    log.info("🔄 Processing subscription for Driver {} - Plan {}", driverId, referenceId);

                    // ⭐ STEP 1: Cancel all active subscriptions for this driver
                    List<PlanRegistration> activeSubscriptions = planRegistrationRepository
                            .findByDriverIdAndStatus(driverId, PaymentStatus.SUBSCRIPTION_ACTIVE);
                    
                    for (PlanRegistration oldSubscription : activeSubscriptions) {
                        oldSubscription.setStatus(PaymentStatus.SUBSCRIPTION_CANCELLED);
                        planRegistrationRepository.save(oldSubscription);
                        log.info("❌ Cancelled old subscription {} for driver {}", 
                                oldSubscription.getId(), driverId);
                    }

                    // ⭐ STEP 2: Calculate duration
                    int durationMonths = 1; // Default 1 month
                    if (plan.getDurationMonths() != null && plan.getDurationMonths() > 0) {
                        durationMonths = plan.getDurationMonths();
                    } else if (plan.getValidityDays() != null) {
                        try {
                            int validityDays = Integer.parseInt(plan.getValidityDays());
                            durationMonths = Math.max(1, validityDays / 30);
                        } catch (NumberFormatException e) {
                            log.warn("⚠️ Invalid validityDays format, using default 1 month");
                        }
                    }

                    // ⭐ STEP 3: Create new active subscription
                    PlanRegistration registration = new PlanRegistration();
                    registration.setDriver(driver);
                    registration.setPlan(plan);
                    registration.setStartDate(LocalDate.now());
                    registration.setEndDate(LocalDate.now().plusMonths(durationMonths));
                    registration.setStatus(PaymentStatus.SUBSCRIPTION_ACTIVE);
                    
                    planRegistrationRepository.save(registration);
                    
                    log.info("✅ Subscription plan {} activated for driver {} via VNPay (valid until {})", 
                            referenceId, driverId, registration.getEndDate());

                    // ⭐ Send subscription payment confirmation email
                    String driverEmail = driver.getAccount().getEmail();
                    if (driverEmail != null && !driverEmail.isEmpty()) {
                        try {
                            emailService.sendSubscriptionPaymentEmail(driverEmail, registration, "VNPAY");
                            log.info("✅ Sent subscription payment confirmation email to {}", driverEmail);
                        } catch (Exception e) {
                            log.error("❌ Failed to send subscription payment email: {}", e.getMessage());
                        }
                    }
                }

                return ResponseEntity.ok()
                        .body(ApiResponse.success("Payment processed successfully", null));

            } else {
                log.warn("VNPay payment failed with response code: {}", responseCode);
                return ResponseEntity.ok()
                        .body(ApiResponse.error("Payment failed with code: " + responseCode));
            }

        } catch (NumberFormatException e) {
            log.error("❌ Invalid number format in transaction: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid transaction data format"));
        } catch (Exception e) {
            log.error("❌ Error processing VNPay callback: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error processing payment: " + e.getMessage()));
        }
    }
}
