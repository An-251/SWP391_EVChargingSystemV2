package swp391.fa25.swp391.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.dto.response.InvoiceDetailResponse;
import swp391.fa25.swp391.entity.Charger;
import swp391.fa25.swp391.entity.ChargingPoint;
import swp391.fa25.swp391.entity.Driver;
import swp391.fa25.swp391.entity.Invoice;
import swp391.fa25.swp391.service.InvoiceService;
import swp391.fa25.swp391.service.PaymentService;
import swp391.fa25.swp391.service.IService.IInvoiceService;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InvoiceController {

    private final IInvoiceService invoiceService;
    private final InvoiceService invoiceServiceImpl;
    private final PaymentService paymentService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final int DAYS_GRACE_PERIOD = 7; // Đồng bộ với InvoiceService

    // ==================== EXISTING ENDPOINTS (giữ nguyên) ====================

    @GetMapping
    public ResponseEntity<?> getAllInvoices() {
        try {
            List<Invoice> invoices = invoiceService.findAll();
            return ResponseEntity.ok(ApiResponse.success("Retrieved all invoices", invoices));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error retrieving invoices: " + e.getMessage()));
        }
    }

    /**
     * ⭐ Admin endpoint to get all invoices
     */
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllInvoicesForAdmin() {
        try {
            List<Invoice> invoices = invoiceService.findAll();
            
            // ⭐ Map to DTO to avoid circular reference
            List<InvoiceDetailResponse> responses = invoices.stream()
                    .map(this::mapToDetailResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(
                    String.format("Found %d invoices", invoices.size()), 
                    responses
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<?> getInvoicesByDriver(@PathVariable Integer driverId) {
        try {
            List<Invoice> invoices = invoiceService.findByDriverId(driverId);

            // ⭐ Map sang DTO với timeline info
            List<InvoiceDetailResponse> responses = invoices.stream()
                    .map(this::mapToDetailResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success("Retrieved driver invoices", responses));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error retrieving invoices: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInvoiceById(@PathVariable Integer id) {
        try {
            Invoice invoice = invoiceService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Invoice not found"));

            // ⭐ Map sang DTO với timeline info
            InvoiceDetailResponse response = mapToDetailResponse(invoice);

            return ResponseEntity.ok(ApiResponse.success("Retrieved invoice", response));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error retrieving invoice: " + e.getMessage()));
        }
    }

    @GetMapping("/driver/{driverId}/unpaid")
    public ResponseEntity<?> getUnpaidInvoices(@PathVariable Integer driverId) {
        try {
            List<Invoice> invoices = invoiceService.findByDriverIdAndStatus(driverId, "UNPAID");

            // ⭐ Map sang DTO với timeline info
            List<InvoiceDetailResponse> responses = invoices.stream()
                    .map(this::mapToDetailResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success("Retrieved unpaid invoices", responses));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error retrieving invoices: " + e.getMessage()));
        }
    }

    @GetMapping("/driver/{driverId}/overdue")
    public ResponseEntity<?> getOverdueInvoices(@PathVariable Integer driverId) {
        try {
            List<Invoice> invoices = invoiceService.findByDriverIdAndStatus(driverId, "OVERDUE");

            // ⭐ Map sang DTO với timeline info
            List<InvoiceDetailResponse> responses = invoices.stream()
                    .map(this::mapToDetailResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success("Retrieved overdue invoices", responses));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error retrieving invoices: " + e.getMessage()));
        }
    }

    // ==================== ⭐ NEW ENDPOINTS - DETAIL & TIMELINE ====================

    /**
     * ⭐ Lấy invoice detail với đầy đủ timeline info (for UI)
     */
    @GetMapping("/{id}/detail")
    public ResponseEntity<?> getInvoiceDetail(@PathVariable Integer id) {
        try {
            Invoice invoice = invoiceService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Invoice not found"));

            InvoiceDetailResponse response = mapToDetailResponse(invoice);

            return ResponseEntity.ok(ApiResponse.success(
                    "Retrieved invoice detail with timeline", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }

    /**
     * ⭐ Lấy current invoice của driver (invoice UNPAID/OVERDUE gần nhất)
     */
    @GetMapping("/driver/{driverId}/current")
    public ResponseEntity<?> getCurrentInvoice(@PathVariable Integer driverId) {
        try {
            // Lấy UNPAID invoices
            List<Invoice> unpaidInvoices = invoiceService.findByDriverIdAndStatus(driverId, "UNPAID");

            if (!unpaidInvoices.isEmpty()) {
                // Lấy invoice mới nhất
                Invoice currentInvoice = unpaidInvoices.stream()
                        .max((i1, i2) -> i1.getIssueDate().compareTo(i2.getIssueDate()))
                        .orElse(null);

                if (currentInvoice != null) {
                    InvoiceDetailResponse response = mapToDetailResponse(currentInvoice);
                    return ResponseEntity.ok(ApiResponse.success(
                            "Current unpaid invoice", response));
                }
            }

            // Nếu không có UNPAID, check OVERDUE
            List<Invoice> overdueInvoices = invoiceService.findByDriverIdAndStatus(driverId, "OVERDUE");

            if (!overdueInvoices.isEmpty()) {
                Invoice overdueInvoice = overdueInvoices.stream()
                        .max((i1, i2) -> i1.getIssueDate().compareTo(i2.getIssueDate()))
                        .orElse(null);

                if (overdueInvoice != null) {
                    InvoiceDetailResponse response = mapToDetailResponse(overdueInvoice);
                    return ResponseEntity.ok(ApiResponse.success(
                            "Current overdue invoice", response));
                }
            }

            return ResponseEntity.ok(ApiResponse.success(
                    "No current invoice found", null));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }

    /**
     * ⭐ Check xem driver có invoice cần thanh toán không (warning check)
     */
    @GetMapping("/driver/{driverId}/needs-payment")
    public ResponseEntity<?> checkNeedsPayment(@PathVariable Integer driverId) {
        try {
            boolean hasUnpaid = invoiceService.existsByDriverIdAndStatus(driverId, "UNPAID");
            boolean hasOverdue = invoiceService.existsByDriverIdAndStatus(driverId, "OVERDUE");

            boolean needsPayment = hasUnpaid || hasOverdue;

            return ResponseEntity.ok(ApiResponse.success(
                    needsPayment ? "Driver has unpaid invoices" : "No payment needed",
                    new PaymentStatusCheck(needsPayment, hasUnpaid, hasOverdue)
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * Admin tạo invoice tổng hợp cho driver từ các session chưa có invoice
     * trong khoảng thời gian 
     */
    @PostMapping("/admin/generate-consolidated")
    public ResponseEntity<?> generateConsolidatedInvoice(@RequestBody ManualGenerateRequest request) {
        try {
            LocalDate startDate = LocalDate.parse(request.getStartDate());
            LocalDate endDate = LocalDate.parse(request.getEndDate());

            Invoice invoice = invoiceServiceImpl.generateInvoiceForUnbilledSessions(
                    request.getDriverId(),
                    startDate,
                    endDate
            );

            if (invoice == null) {
                return ResponseEntity.ok(ApiResponse.success(
                        "No unbilled sessions found for this period", null
                ));
            }

            InvoiceDetailResponse response = mapToDetailResponse(invoice);

            return ResponseEntity.ok(ApiResponse.success(
                    "Consolidated invoice generated successfully",
                    response
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to generate consolidated invoice: " + e.getMessage()));
        }
    }

    @PostMapping("/admin/generate-manual")
    public ResponseEntity<?> generateManualInvoice(@RequestBody ManualGenerateRequest request) {
        try {
            LocalDate startDate = LocalDate.parse(request.getStartDate());
            LocalDate endDate = LocalDate.parse(request.getEndDate());

            Invoice invoice = invoiceServiceImpl.manualGenerateInvoice(
                    request.getDriverId(),
                    startDate,
                    endDate
            );

            if (invoice == null) {
                return ResponseEntity.ok(ApiResponse.success(
                        "No sessions found for this period", null
                ));
            }

            InvoiceDetailResponse response = mapToDetailResponse(invoice);

            return ResponseEntity.ok(ApiResponse.success(
                    "Invoice generated successfully",
                    response
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to generate invoice: " + e.getMessage()));
        }
    }

    @PostMapping("/admin/generate-all")
    public ResponseEntity<?> generateAllInvoices() {
        try {
            invoiceServiceImpl.generateMonthlyInvoices();
            return ResponseEntity.ok(ApiResponse.success(
                    "Monthly invoice generation triggered. Check logs for details.", null
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed: " + e.getMessage()));
        }
    }

    @PostMapping("/admin/check-overdue")
    public ResponseEntity<?> checkOverdueInvoices() {
        try {
            invoiceServiceImpl.checkOverdueInvoices();
            return ResponseEntity.ok(ApiResponse.success(
                    "Overdue check completed. Check logs for details.", null
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed: " + e.getMessage()));
        }
    }

    /**
     * ⭐ ADMIN: Trigger reminder manually
     */
    @PostMapping("/admin/send-reminders")
    public ResponseEntity<?> sendReminders() {
        try {
            invoiceServiceImpl.sendPaymentReminders();
            return ResponseEntity.ok(ApiResponse.success(
                    "Payment reminders sent. Check logs for details.", null
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed: " + e.getMessage()));
        }
    }

    /**
     * ⭐ ADMIN: Trigger suspension check manually
     */
    @PostMapping("/admin/check-suspensions")
    public ResponseEntity<?> checkSuspensions() {
        try {
            invoiceServiceImpl.suspendOverdueAccounts();
            return ResponseEntity.ok(ApiResponse.success(
                    "Suspension check completed. Check logs for details.", null
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed: " + e.getMessage()));
        }
    }

    // ==================== HELPER METHODS ====================

    /**
     * ⭐ Map Invoice entity sang InvoiceDetailResponse DTO với timeline info
     */
    private InvoiceDetailResponse mapToDetailResponse(Invoice invoice) {
        Instant now = Instant.now();

        // Calculate timeline
        Long daysUntilDue = null;
        Long daysUntilSuspension = null;
        Boolean inGracePeriod = false;
        String statusMessage = "";
        String warningMessage = "";

        if (invoice.getDueDate() != null) {
            long secondsUntilDue = invoice.getDueDate().getEpochSecond() - now.getEpochSecond();
            daysUntilDue = secondsUntilDue / (24 * 60 * 60);

            Instant suspendDate = Instant.ofEpochSecond(
                    invoice.getDueDate().getEpochSecond() + (DAYS_GRACE_PERIOD * 24 * 60 * 60)
            );
            long secondsUntilSuspend = suspendDate.getEpochSecond() - now.getEpochSecond();
            daysUntilSuspension = secondsUntilSuspend / (24 * 60 * 60);

            // Status message
            if ("PAID".equals(invoice.getStatus())) {
                statusMessage = "Đã thanh toán";
            } else if (daysUntilDue > 0) {
                statusMessage = String.format("Còn %d ngày để thanh toán", daysUntilDue);
            } else if (daysUntilDue == 0) {
                statusMessage = "Hôm nay là hạn thanh toán";
            } else {
                statusMessage = String.format("Quá hạn %d ngày", Math.abs(daysUntilDue));
                inGracePeriod = daysUntilSuspension > 0;
            }

            // Warning message
            if ("OVERDUE".equals(invoice.getStatus()) && daysUntilSuspension > 0) {
                warningMessage = String.format(
                        "⚠️ Tài khoản sẽ bị khóa sau %d ngày nếu không thanh toán",
                        daysUntilSuspension
                );
            } else if ("OVERDUE".equals(invoice.getStatus()) && daysUntilSuspension <= 0) {
                warningMessage = "🔒 Tài khoản đã bị khóa. Vui lòng thanh toán để mở khóa.";
            } else if (daysUntilDue <= 3 && daysUntilDue > 0) {
                warningMessage = "⏰ Hóa đơn sắp đến hạn. Vui lòng thanh toán sớm.";
            }
        }

        // Format billing period
        String billingPeriod = null;
        if (invoice.getBillingStartDate() != null && invoice.getBillingEndDate() != null) {
            billingPeriod = invoice.getBillingStartDate().format(DATE_FORMATTER) +
                    " - " + invoice.getBillingEndDate().format(DATE_FORMATTER);
        }

        // Check account status
        Boolean isAccountSuspended = "SUSPENDED".equals(
                invoice.getDriver().getAccount().getStatus()
        );
        
        // Map charging sessions
        java.util.List<InvoiceDetailResponse.SessionSummary> sessionSummaries = null;
        if (invoice.getSessions() != null && !invoice.getSessions().isEmpty()) {
            sessionSummaries = invoice.getSessions().stream()
                    .map(session -> {
                        String duration = null;
                        if (session.getStartTime() != null && session.getEndTime() != null) {
                            // Convert LocalDateTime to seconds for duration calculation
                            java.time.Duration dur = java.time.Duration.between(
                                    session.getStartTime(), 
                                    session.getEndTime()
                            );
                            long hours = dur.toHours();
                            long minutes = dur.toMinutesPart();
                            duration = String.format("%d giờ %d phút", hours, minutes);
                        }
                        
                        String stationName = null;
                        String chargingPointName = null;
                        Charger charger = session.getCharger();
                        if (charger != null) {
                            ChargingPoint chargingPoint = charger.getChargingPoint();
                            if (chargingPoint != null) {
                                chargingPointName = chargingPoint.getPointName();
                                if (chargingPoint.getStation() != null) {
                                    stationName = chargingPoint.getStation().getStationName();
                                }
                            }
                        }
                        
                        // Convert LocalDateTime to Instant for response
                        Instant startInstant = session.getStartTime() != null 
                                ? session.getStartTime().atZone(java.time.ZoneId.systemDefault()).toInstant()
                                : null;
                        Instant endInstant = session.getEndTime() != null
                                ? session.getEndTime().atZone(java.time.ZoneId.systemDefault()).toInstant()
                                : null;
                        
                        return InvoiceDetailResponse.SessionSummary.builder()
                                .id(session.getId())
                                .startTime(startInstant)
                                .endTime(endInstant)
                                .duration(duration)
                                .energyConsumed(session.getKwhUsed())
                                .cost(session.getCost())
                                .stationName(stationName)
                                .chargingPointName(chargingPointName)
                                .build();
                    })
                    .collect(Collectors.toList());
        }

        return InvoiceDetailResponse.builder()
                .invoiceId(invoice.getId())
                .status(invoice.getStatus())
                .totalCost(invoice.getTotalCost())
                .billingStartDate(invoice.getBillingStartDate())
                .billingEndDate(invoice.getBillingEndDate())
                .billingPeriod(billingPeriod)
                .issueDate(invoice.getIssueDate())
                .dueDate(invoice.getDueDate())
                .paidDate(invoice.getPaidDate())
                .paymentMethod(invoice.getPaymentMethod())
                .paymentReference(invoice.getPaymentReference())
                .driverId(invoice.getDriver().getId())
                .driverName(invoice.getDriver().getAccount().getFullName())
                .driverPhone(invoice.getDriver().getAccount().getPhone())
                .driverEmail(invoice.getDriver().getAccount().getEmail())
                .planId(invoice.getPlanAtBilling() != null ? invoice.getPlanAtBilling().getId() : null)
                .planName(invoice.getPlanAtBilling() != null ? invoice.getPlanAtBilling().getPlanName() : null)
                .planMonthlyFee(invoice.getPlanAtBilling() != null ? invoice.getPlanAtBilling().getPrice() : null)
                .daysUntilDue(daysUntilDue)
                .daysUntilSuspension(daysUntilSuspension)
                .inGracePeriod(inGracePeriod)
                .isAccountSuspended(isAccountSuspended)
                .statusMessage(statusMessage)
                .warningMessage(warningMessage)
                .qrCode(invoice.getQrCode())
                .qrCodeExpired(false) // TODO: implement QR expiry check if needed
                .sessions(sessionSummaries)
                .build();
    }


    /**
     * ⭐ NEW: Lấy danh sách tất cả driver có thể tạo invoice (cho admin dashboard)
     */
    @GetMapping("/admin/drivers-ready")
    public ResponseEntity<?> getDriversReadyForInvoice() {
        try {
            List<Driver> allDrivers = invoiceServiceImpl.findAllActiveDrivers();
            
            System.out.println("========== DEBUG DRIVERS READY ==========");
            System.out.println("Total active drivers found: " + allDrivers.size());

            List<InvoiceReadyResponse> readyDrivers = new ArrayList<>();

            for (Driver driver : allDrivers) {
                System.out.println("\n--- Checking Driver ID: " + driver.getId() + " (" + driver.getAccount().getFullName() + ") ---");
                
                // Tính billing period cho từng driver
                LocalDate billingStartDate;
                LocalDate billingEndDate = LocalDate.now();

                List<Invoice> driverInvoices = invoiceService.findByDriverId(driver.getId());
                System.out.println("Previous invoices count: " + driverInvoices.size());

                if (driverInvoices.isEmpty()) {
                    billingStartDate = driver.getAccount().getCreatedDate()
                            .atZone(ZoneId.systemDefault()).toLocalDate();
                    System.out.println("No previous invoices - Using account creation date: " + billingStartDate);
                } else {
                    Invoice lastInvoice = driverInvoices.stream()
                            .max((i1, i2) -> i1.getIssueDate().compareTo(i2.getIssueDate()))
                            .orElseThrow();
                    billingStartDate = lastInvoice.getBillingEndDate().plusDays(1);
                    System.out.println("Last invoice end date: " + lastInvoice.getBillingEndDate());
                    System.out.println("New billing start date: " + billingStartDate);
                }

                long daysSinceStart = ChronoUnit.DAYS.between(billingStartDate, billingEndDate);
                System.out.println("Days since billing start: " + daysSinceStart);

                // ⭐ SỬA: Convert LocalDate sang LocalDateTime
                LocalDateTime startDateTime = billingStartDate.atStartOfDay();
                LocalDateTime endDateTime = billingEndDate.atTime(23, 59, 59);
                
                System.out.println("Query range: " + startDateTime + " to " + endDateTime);
                
                long unbilledCount = invoiceServiceImpl.countUnbilledSessions(
                        driver.getId(),
                        startDateTime,
                        endDateTime
                );
                
                System.out.println("Unbilled sessions count: " + unbilledCount);
                System.out.println("Eligible for invoice: " + (daysSinceStart >= 30 && unbilledCount > 0));

                // ⭐ Chỉ thêm driver đã đủ 30 ngày VÀ có session chưa billing
                if (daysSinceStart >= 30 && unbilledCount > 0) {
                    readyDrivers.add(InvoiceReadyResponse.builder()
                            .driverId(driver.getId())
                            .driverName(driver.getAccount().getFullName())
                            .driverEmail(driver.getAccount().getEmail())
                            .isReady(true)
                            .daysSinceBillingStart(daysSinceStart)
                            .billingStartDate(billingStartDate)
                            .billingEndDate(billingEndDate)
                            .unbilledSessionCount(unbilledCount)
                            .message("Sẵn sàng tạo invoice")
                            .build());
                    System.out.println("✅ Driver ADDED to ready list");
                } else {
                    System.out.println("❌ Driver NOT added - Days: " + daysSinceStart + " >= 30? " + (daysSinceStart >= 30) + ", Count: " + unbilledCount + " > 0? " + (unbilledCount > 0));
                }
            }
            
            System.out.println("\n========== FINAL RESULT ==========");
            System.out.println("Total drivers ready: " + readyDrivers.size());
            System.out.println("====================================\n");

            return ResponseEntity.ok(ApiResponse.success(
                    String.format("Found %d drivers ready for invoice", readyDrivers.size()),
                    readyDrivers
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }
    @GetMapping("/admin/check-ready/{driverId}")
    public ResponseEntity<?> checkInvoiceReady(@PathVariable Integer driverId) {
        try {
            // Lấy invoice gần nhất của driver
            List<Invoice> allInvoices = invoiceService.findByDriverId(driverId);

            LocalDate billingStartDate;
            LocalDate billingEndDate = LocalDate.now();

            if (allInvoices.isEmpty()) {
                // USER MỚI - Tính từ ngày đăng ký
                Driver driver = invoiceServiceImpl.findDriverById(driverId);
                Instant registeredDate = driver.getAccount().getCreatedDate();
                billingStartDate = registeredDate.atZone(ZoneId.systemDefault()).toLocalDate();

            } else {
                // USER CŨ - Tính từ invoice gần nhất
                Invoice lastInvoice = allInvoices.stream()
                        .max((i1, i2) -> i1.getIssueDate().compareTo(i2.getIssueDate()))
                        .orElseThrow();

                billingStartDate = lastInvoice.getBillingEndDate().plusDays(1);
            }

            // CHECK: Đã đủ 30 ngày chưa?
            long daysSinceStart = ChronoUnit.DAYS.between(billingStartDate, billingEndDate);
            boolean isReady = daysSinceStart >= 30;

            // ⭐ CHECK: Có session nào chưa billing không?
            long unbilledCount = invoiceServiceImpl.countUnbilledSessions(
                    driverId,
                    billingStartDate.atStartOfDay(),
                    billingEndDate.atTime(23, 59, 59)
            );

            InvoiceReadyResponse response = InvoiceReadyResponse.builder()
                    .driverId(driverId)
                    .isReady(isReady && unbilledCount > 0)
                    .daysSinceBillingStart(daysSinceStart)
                    .billingStartDate(billingStartDate)
                    .billingEndDate(billingEndDate)
                    .unbilledSessionCount(unbilledCount)
                    .message(isReady && unbilledCount > 0
                            ? "Đã đủ 30 ngày, có thể tạo invoice"
                            : "Chưa đủ điều kiện tạo invoice")
                    .build();

            return ResponseEntity.ok(ApiResponse.success(
                    "Invoice readiness check completed", response
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }

    // ==================== DTOs ====================

    @lombok.Data
    public static class ManualGenerateRequest {
        private Integer driverId;
        private String startDate;
        private String endDate;
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class PaymentStatusCheck {
        private Boolean needsPayment;
        private Boolean hasUnpaid;
        private Boolean hasOverdue;
    }
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class InvoiceReadyResponse {
        private Integer driverId;
        private String driverName;
        private String driverEmail;
        private Boolean isReady;
        private Long daysSinceBillingStart;
        private LocalDate billingStartDate;
        private LocalDate billingEndDate;
        private Long unbilledSessionCount;
        private String message;
    }

}