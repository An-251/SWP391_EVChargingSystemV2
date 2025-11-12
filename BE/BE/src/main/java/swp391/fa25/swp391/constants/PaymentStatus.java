package swp391.fa25.swp391.constants;

/**
 * Payment and Subscription Status Constants
 * Standardized across the entire application (lowercase)
 */
public class PaymentStatus {
    
    // ==================== INVOICE STATUS ====================
    public static final String INVOICE_UNPAID = "unpaid";
    public static final String INVOICE_PAID = "paid";
    public static final String INVOICE_OVERDUE = "overdue";
    public static final String INVOICE_CANCELLED = "cancelled";
    
    // ==================== SUBSCRIPTION STATUS ====================
    public static final String SUBSCRIPTION_PENDING = "pending";      // Waiting for payment
    public static final String SUBSCRIPTION_ACTIVE = "active";        // Currently active
    public static final String SUBSCRIPTION_EXPIRED = "expired";      // Past end date
    public static final String SUBSCRIPTION_CANCELLED = "cancelled";  // Manually cancelled
    
    // ==================== CASH PAYMENT REQUEST STATUS ====================
    public static final String PAYMENT_REQUEST_PENDING = "pending";
    public static final String PAYMENT_REQUEST_APPROVED = "approved";
    public static final String PAYMENT_REQUEST_REJECTED = "rejected";
    public static final String PAYMENT_REQUEST_EXPIRED = "expired";
    
    // ==================== PAYMENT METHOD ====================
    public static final String PAYMENT_METHOD_CASH = "cash";
    public static final String PAYMENT_METHOD_VNPAY = "vnpay";
    public static final String PAYMENT_METHOD_CARD = "card";
    public static final String PAYMENT_METHOD_EWALLET = "ewallet";
    
    private PaymentStatus() {
        // Prevent instantiation
    }
}
