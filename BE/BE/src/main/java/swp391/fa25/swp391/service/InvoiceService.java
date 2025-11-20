package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.entity.*;
import swp391.fa25.swp391.repository.*;
import swp391.fa25.swp391.service.IService.IInvoiceService;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceService implements IInvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ChargingSessionRepository sessionRepository;
    private final DriverRepository driverRepository;
    private final PlanRegistrationRepository planRegistrationRepository;
    private final SubscriptionPlanRepository planRepository;
    private final AccountRepository accountRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    // ==================== CONFIGURATION ====================
    private static final int DAYS_TO_DUE_DATE = 7; // Invoice → Due date: 7 ngày
    private static final int DAYS_GRACE_PERIOD = 7; // Due date → Suspend: 7 ngày
    private static final int DAYS_BEFORE_DUE_REMINDER = 3; // Gửi reminder trước due date 3 ngày

    // ==================== EXISTING METHODS (giữ nguyên) ====================

    @Override
    public Invoice save(Invoice invoice) {
        return invoiceRepository.save(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Invoice> findById(Integer id) {
        return invoiceRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Invoice> findAll() {
        return invoiceRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Invoice> findByDriverId(Integer driverId) {
        return invoiceRepository.findByDriver_Id(driverId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Invoice> findByStatus(String status) {
        return invoiceRepository.findByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Invoice> findByDriverIdAndStatus(Integer driverId, String status) {
        return invoiceRepository.findByDriver_IdAndStatus(driverId, status);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByDriverIdAndStatus(Integer driverId, String status) {
        return invoiceRepository.existsByDriver_IdAndStatus(driverId, status);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getTotalRevenueByStatus(String status) {
        BigDecimal result = invoiceRepository.getTotalRevenueByStatus(status);
        return result != null ? result : BigDecimal.ZERO;
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getTotalRevenueByDriverAndStatus(Integer driverId, String status) {
        BigDecimal result = invoiceRepository.getTotalRevenueByDriverAndStatus(driverId, status);
        return result != null ? result : BigDecimal.ZERO;
    }

    @Override
    public void deleteById(Integer id) {
        invoiceRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Invoice> findDriverInvoicesByDateRange(Integer driverId, Instant startDate, Instant endDate) {
        return invoiceRepository.findDriverInvoicesByDateRange(driverId, startDate, endDate);
    }

    // ==================== MONTHLY INVOICE GENERATION (Updated với Notification) ====================

    /**
     * SCHEDULED JOB: Tạo invoice cuối tháng
     * Chạy lúc 00:00 ngày cuối tháng
     */
    @Scheduled(cron = "0 0 0 L * ?")
    @Transactional
    public void generateMonthlyInvoices() {
        log.info("========== STARTING MONTHLY INVOICE GENERATION ==========");

        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());

        List<Driver> allDrivers = driverRepository.findAllWithActivePlan();
        log.info("Found {} drivers with active plans", allDrivers.size());

        int successCount = 0;
        int failureCount = 0;
        int noSessionCount = 0;

        for (Driver driver : allDrivers) {
            try {
                Invoice invoice = generateInvoiceForDriver(driver, startOfMonth, endOfMonth);
                if (invoice != null) {
                    successCount++;

                    // GỬI NOTIFICATION
                    try {
                        notificationService.sendInvoiceCreatedNotification(invoice);
                    } catch (Exception e) {
                        log.error("Failed to send notification for invoice {}", invoice.getId(), e);
                    }

                    log.info("Generated invoice {} for driver {}", invoice.getId(), driver.getId());
                } else {
                    noSessionCount++;
                    log.info("No sessions for driver {}, skipped", driver.getId());
                }
            } catch (Exception e) {
                log.error("Failed to generate invoice for driver {}: {}",
                        driver.getId(), e.getMessage(), e);
                failureCount++;
            }
        }

        log.info("========== INVOICE GENERATION COMPLETED ==========");
        log.info("Success: {}, No sessions: {}, Failed: {}",
                successCount, noSessionCount, failureCount);
    }

    /**
     * Tạo invoice cho 1 driver (Updated với Due Date)
     */
    @Transactional
    public Invoice generateInvoiceForDriver(Driver driver, LocalDate startDate, LocalDate endDate) {
        log.info("Generating invoice for driver {} from {} to {}",
                driver.getId(), startDate, endDate);

        // 1. Lấy tất cả unbilled completed sessions trong khoảng thời gian
        List<ChargingSession> sessions = sessionRepository.findUnbilledSessionsByDriverAndDateRange(
                driver.getId(),
                startDate.atStartOfDay(),
                endDate.atTime(23, 59, 59)
        );

        if (sessions.isEmpty()) {
            log.info("Driver {} has no completed sessions this month", driver.getId());
            return null;
        }

        log.info("Driver {} has {} sessions", driver.getId(), sessions.size());

        // 2. Tính total cost (xử lý đổi plan giữa tháng)
        BigDecimal totalSessionCost = calculateTotalCostWithPlanChanges(
                driver, sessions, startDate, endDate
        );

        // 3. Lấy plan hiện tại để thêm monthly fee
        Optional<PlanRegistration> currentPlanOpt = planRegistrationRepository
                .findActiveByDriverId(driver.getId(), LocalDate.now());

        BigDecimal monthlyFee = BigDecimal.ZERO;
        SubscriptionPlan currentPlan = null;

        if (currentPlanOpt.isPresent()) {
            currentPlan = currentPlanOpt.get().getPlan();
            if (currentPlan.getPrice() != null) {
                monthlyFee = currentPlan.getPrice();
            }
        }

        BigDecimal totalCost = totalSessionCost.add(monthlyFee);

        log.info("Driver {}: Sessions cost = {}, Monthly fee = {}, Total = {}",
                driver.getId(), totalSessionCost, monthlyFee, totalCost);

        // 4. Tạo invoice với Due Date
        Instant issueDate = Instant.now();
        Instant dueDate = issueDate.plus(DAYS_TO_DUE_DATE, ChronoUnit.DAYS);

        Invoice invoice = new Invoice();
        invoice.setDriver(driver);
        invoice.setBillingStartDate(startDate);
        invoice.setBillingEndDate(endDate);
        invoice.setIssueDate(issueDate);
        invoice.setDueDate(dueDate);
        invoice.setTotalCost(totalCost);
        invoice.setStatus("unpaid");
        invoice.setPlanAtBilling(currentPlan);

        // Lưu invoice trước để có ID
        Invoice savedInvoice = invoiceRepository.save(invoice);

        // Cập nhật invoice reference cho các sessions
        for (ChargingSession session : sessions) {
            session.setInvoice(savedInvoice);
            sessionRepository.save(session);
        }
        savedInvoice.setSessions(sessions);

        log.info("Created invoice {} for driver {}, amount: {}, due date: {}, sessions: {}",
                savedInvoice.getId(), driver.getId(), totalCost, dueDate, sessions.size());

        // Send invoice email notification
        try {
            String driverEmail = driver.getAccount().getEmail();
            if (driverEmail != null && !driverEmail.isEmpty()) {
                emailService.sendInvoiceEmail(driverEmail, savedInvoice);
                log.info("Invoice email sent to driver {} at {}", driver.getId(), driverEmail);
            }
        } catch (Exception e) {
            log.error("Failed to send invoice email to driver {}: {}", driver.getId(), e.getMessage());
            // Don't throw - invoice is still created successfully
        }

        return savedInvoice;
    }

    /**
     * Tính cost khi driver đổi plan giữa tháng
     */
    private BigDecimal calculateTotalCostWithPlanChanges(
            Driver driver,
            List<ChargingSession> sessions,
            LocalDate startDate,
            LocalDate endDate
    ) {
        Map<Integer, List<ChargingSession>> sessionsByPlan = new HashMap<>();

        for (ChargingSession session : sessions) {
            LocalDate sessionDate = session.getStartTime().toLocalDate();

            Optional<PlanRegistration> planAtTime = planRegistrationRepository
                    .findActivePlanAtDate(driver.getId(), sessionDate);

            if (planAtTime.isPresent()) {
                Integer planId = planAtTime.get().getPlan().getId();
                sessionsByPlan.computeIfAbsent(planId, k -> new ArrayList<>())
                        .add(session);
            } else {
                log.warn("No active plan found for driver {} on date {}. Using session cost as-is.",
                        driver.getId(), sessionDate);
            }
        }

        BigDecimal totalCost = BigDecimal.ZERO;

        for (Map.Entry<Integer, List<ChargingSession>> entry : sessionsByPlan.entrySet()) {
            SubscriptionPlan plan = planRepository.findById(entry.getKey())
                    .orElseThrow(() -> new RuntimeException("Plan not found: " + entry.getKey()));

            List<ChargingSession> planSessions = entry.getValue();

            BigDecimal planCost = planSessions.stream()
                    .map(ChargingSession::getCost)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            totalCost = totalCost.add(planCost);

            log.info("Plan {} ({} sessions): {} VND",
                    plan.getPlanName(), planSessions.size(), planCost);
        }

        return totalCost;
    }

    /**
     * MANUAL: Tạo invoice thủ công (để test)
     */
    @Transactional
    public Invoice manualGenerateInvoice(Integer driverId, LocalDate startDate, LocalDate endDate) {
        log.info("MANUAL invoice generation for driver {}", driverId);

        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        Invoice invoice = generateInvoiceForDriver(driver, startDate, endDate);

        // Gửi notification
        if (invoice != null) {
            try {
                notificationService.sendInvoiceCreatedNotification(invoice);
            } catch (Exception e) {
                log.error("Failed to send notification", e);
            }
        }

        return invoice;
    }

    /**
     * Tạo invoice tổng hợp cho các sessions chưa có invoice
     */
    @Transactional
    public Invoice generateInvoiceForUnbilledSessions(Integer driverId, LocalDate startDate, LocalDate endDate) {
        log.info("Generating consolidated invoice for unbilled sessions. Driver: {}, Period: {} to {}",
                driverId, startDate, endDate);

        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        // 1. Lấy các sessions chưa có invoice
        List<ChargingSession> unbilledSessions = sessionRepository.findUnbilledSessionsByDriverAndDateRange(
                driver.getId(),
                startDate.atStartOfDay(),
                endDate.atTime(23, 59, 59)
        );

        if (unbilledSessions.isEmpty()) {
            log.info("No unbilled sessions found for driver {} in period {} to {}",
                    driverId, startDate, endDate);
            return null;
        }

        log.info("Found {} unbilled sessions for driver {}", unbilledSessions.size(), driverId);

        // 2. Tính tổng cost
        BigDecimal totalSessionsCost = unbilledSessions.stream()
                .map(ChargingSession::getCost)
                .filter(cost -> cost != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        log.info("Total sessions cost: {}", totalSessionsCost);

        // 3. Tạo invoice
        Instant issueDate = Instant.now();
        Instant dueDate = issueDate.plus(DAYS_TO_DUE_DATE, ChronoUnit.DAYS);

        Invoice invoice = new Invoice();
        invoice.setDriver(driver);
        invoice.setBillingStartDate(startDate);
        invoice.setBillingEndDate(endDate);
        invoice.setIssueDate(issueDate);
        invoice.setDueDate(dueDate);
        invoice.setTotalCost(totalSessionsCost);
        invoice.setStatus("unpaid");

        // Get current plan
        Optional<PlanRegistration> currentPlanOpt = planRegistrationRepository
                .findActiveByDriverId(driver.getId(), LocalDate.now());
        if (currentPlanOpt.isPresent()) {
            invoice.setPlanAtBilling(currentPlanOpt.get().getPlan());
        }

        // 4. Lưu invoice
        Invoice savedInvoice = invoiceRepository.save(invoice);

        // 5. Cập nhật invoice reference cho các sessions
        for (ChargingSession session : unbilledSessions) {
            session.setInvoice(savedInvoice);
            sessionRepository.save(session);
        }
        savedInvoice.setSessions(unbilledSessions);

        // Send invoice email notification
        try {
            String driverEmail = driver.getAccount().getEmail();
            if (driverEmail != null && !driverEmail.isEmpty()) {
                emailService.sendInvoiceEmail(driverEmail, savedInvoice);
                log.info("Unbilled sessions invoice email sent to driver {} at {}", driver.getId(), driverEmail);
            }
        } catch (Exception e) {
            log.error("Failed to send unbilled invoice email to driver {}: {}", driver.getId(), e.getMessage());
        }

        // 6. Gửi notification
        try {
            notificationService.sendInvoiceCreatedNotification(savedInvoice);
        } catch (Exception e) {
            log.error("Failed to send notification", e);
        }

        log.info("Created consolidated invoice {} for driver {}, amount: {}, sessions: {}, due date: {}",
                savedInvoice.getId(), driver.getId(), totalSessionsCost, 
                unbilledSessions.size(), dueDate);

        return savedInvoice;
    }

    // ==================== REMINDER & OVERDUE CHECKS (Tích hợp vào file này) ====================

    /**
     * SCHEDULED JOB: Gửi payment reminder
     * Chạy mỗi ngày lúc 09:00 AM
     * Gửi cho invoices sắp đến hạn (3 ngày trước due date)
     */
    @Scheduled(cron = "0 0 9 * * ?")
    @Transactional
    public void sendPaymentReminders() {
        log.info("========== CHECKING INVOICES FOR REMINDERS ==========");

        Instant now = Instant.now();
        Instant reminderThreshold = now.plus(DAYS_BEFORE_DUE_REMINDER, ChronoUnit.DAYS);

        // Lấy invoices unpaid có due date trong 3 ngày tới
        List<Invoice> upcomingDueInvoices = invoiceRepository.findByStatus("unpaid").stream()
                .filter(inv -> inv.getDueDate() != null)
                .filter(inv -> inv.getDueDate().isAfter(now) && inv.getDueDate().isBefore(reminderThreshold))
                .toList();

        log.info("Found {} invoices needing reminders", upcomingDueInvoices.size());

        for (Invoice invoice : upcomingDueInvoices) {
            try {
                notificationService.sendPaymentReminderNotification(invoice);
                log.info("Sent reminder for invoice {}", invoice.getId());
            } catch (Exception e) {
                log.error("Failed to send reminder for invoice {}", invoice.getId(), e);
            }
        }

        log.info("========== REMINDER CHECK COMPLETED ==========");
    }

    /**
     * SCHEDULED JOB: Check overdue invoices và gửi warning
     * Chạy mỗi ngày lúc 01:00 AM
     */
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void checkOverdueInvoices() {
        log.info("========== CHECKING OVERDUE INVOICES ==========");

        Instant now = Instant.now();
        List<Invoice> overdueInvoices = invoiceRepository.findByStatusAndDueDateBefore("unpaid", now);

        log.info("Found {} overdue invoices", overdueInvoices.size());

        for (Invoice invoice : overdueInvoices) {
            try {
                // Update invoice status
                invoice.setStatus("overdue");
                invoiceRepository.save(invoice);

                // Gửi warning notification
                notificationService.sendOverdueWarningNotification(invoice);

                log.warn("Invoice {} marked as overdue", invoice.getId());

            } catch (Exception e) {
                log.error("Failed to process overdue invoice {}", invoice.getId(), e);
            }
        }

        log.info("========== OVERDUE CHECK COMPLETED ==========");
    }

    /**
     * SCHEDULED JOB: Suspend accounts với invoices quá grace period
     * Chạy mỗi ngày lúc 02:00 AM
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void suspendOverdueAccounts() {
        log.info("========== CHECKING ACCOUNTS FOR SUSPENSION ==========");

        Instant now = Instant.now();
        Instant suspensionThreshold = now.minus(DAYS_GRACE_PERIOD, ChronoUnit.DAYS);

        // Lấy invoices overdue quá grace period
        List<Invoice> suspendableInvoices = invoiceRepository.findByStatus("overdue").stream()
                .filter(inv -> inv.getDueDate() != null)
                .filter(inv -> inv.getDueDate().isBefore(suspensionThreshold))
                .toList();

        log.info("Found {} accounts to suspend", suspendableInvoices.size());

        for (Invoice invoice : suspendableInvoices) {
            try {
                Account account = invoice.getDriver().getAccount();

                // Chỉ suspend nếu chưa bị suspend
                if ("active".equalsIgnoreCase(account.getStatus())) {
                    account.setStatus("suspended");
                    accountRepository.save(account);

                    // Gửi notification
                    notificationService.sendAccountSuspendedNotification(invoice);

                    log.error("Suspended account {} due to overdue invoice {}",
                            account.getId(), invoice.getId());
                }

            } catch (Exception e) {
                log.error("Failed to suspend account for invoice {}", invoice.getId(), e);
            }
        }

        log.info("========== SUSPENSION CHECK COMPLETED ==========");
    }
    public long countUnbilledSessions(Integer driverId, LocalDateTime startTime, LocalDateTime endTime) {
        return sessionRepository.countByDriverIdAndInvoiceIsNullAndStartTimeBetween(
                driverId, startTime, endTime
        );
    }

    /**
     * Lấy tất cả driver đang active
     */
    public List<Driver> findAllActiveDrivers() {
        return driverRepository.findByAccountStatus("active");
    }

    public Driver findDriverById(Integer driverId) {
        return driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
    }
}