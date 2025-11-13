/**
 * Payment and Subscription Status Constants
 * Synchronized with Backend (PaymentStatus.java) - lowercase
 */

// ==================== INVOICE STATUS ====================
export const INVOICE_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
};

// ==================== SUBSCRIPTION STATUS ====================
export const SUBSCRIPTION_STATUS = {
  PENDING: 'pending',      // Waiting for payment
  ACTIVE: 'active',        // Currently active
  EXPIRED: 'expired',      // Past end date
  CANCELLED: 'cancelled',  // Manually cancelled
};

// ==================== CASH PAYMENT REQUEST STATUS ====================
export const PAYMENT_REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
};

// ==================== PAYMENT METHOD ====================
export const PAYMENT_METHOD = {
  CASH: 'cash',
  VNPAY: 'vnpay',
  CARD: 'card',
  EWALLET: 'ewallet',
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get display text for invoice status (handles both lowercase and uppercase)
 */
export const getInvoiceStatusText = (status) => {
  const normalized = status?.toLowerCase();
  const statusMap = {
    [INVOICE_STATUS.UNPAID]: 'Chưa thanh toán',
    [INVOICE_STATUS.PAID]: 'Đã thanh toán',
    [INVOICE_STATUS.OVERDUE]: 'Quá hạn',
    [INVOICE_STATUS.CANCELLED]: 'Đã hủy',
  };
  return statusMap[normalized] || status;
};

/**
 * Get display text for subscription status (handles both lowercase and uppercase)
 */
export const getSubscriptionStatusText = (status) => {
  const normalized = status?.toLowerCase();
  const statusMap = {
    [SUBSCRIPTION_STATUS.PENDING]: 'Chờ thanh toán',
    [SUBSCRIPTION_STATUS.ACTIVE]: 'Đang hoạt động',
    [SUBSCRIPTION_STATUS.EXPIRED]: 'Đã hết hạn',
    [SUBSCRIPTION_STATUS.CANCELLED]: 'Đã hủy',
  };
  return statusMap[normalized] || status;
};

/**
 * Get display text for payment request status
 */
export const getPaymentRequestStatusText = (status) => {
  const normalized = status?.toLowerCase();
  const statusMap = {
    [PAYMENT_REQUEST_STATUS.PENDING]: 'Chờ duyệt',
    [PAYMENT_REQUEST_STATUS.APPROVED]: 'Đã duyệt',
    [PAYMENT_REQUEST_STATUS.REJECTED]: 'Đã từ chối',
    [PAYMENT_REQUEST_STATUS.EXPIRED]: 'Đã hết hạn',
  };
  return statusMap[normalized] || status;
};

/**
 * Get color for subscription status (handles both lowercase and uppercase)
 */
export const getSubscriptionStatusColor = (status) => {
  const normalized = status?.toLowerCase();
  const colorMap = {
    [SUBSCRIPTION_STATUS.PENDING]: 'orange',
    [SUBSCRIPTION_STATUS.ACTIVE]: 'green',
    [SUBSCRIPTION_STATUS.EXPIRED]: 'gray',
    [SUBSCRIPTION_STATUS.CANCELLED]: 'red',
  };
  return colorMap[normalized] || 'default';
};

/**
 * Get color for invoice status (handles both lowercase and uppercase)
 */
export const getInvoiceStatusColor = (status) => {
  const normalized = status?.toLowerCase();
  const colorMap = {
    [INVOICE_STATUS.UNPAID]: 'orange',
    [INVOICE_STATUS.PAID]: 'green',
    [INVOICE_STATUS.OVERDUE]: 'red',
    [INVOICE_STATUS.CANCELLED]: 'gray',
  };
  return colorMap[normalized] || 'default';
};

/**
 * Get color for payment request status (handles both lowercase and uppercase)
 */
export const getPaymentRequestStatusColor = (status) => {
  const normalized = status?.toLowerCase();
  const colorMap = {
    [PAYMENT_REQUEST_STATUS.PENDING]: 'orange',
    [PAYMENT_REQUEST_STATUS.APPROVED]: 'green',
    [PAYMENT_REQUEST_STATUS.REJECTED]: 'red',
    [PAYMENT_REQUEST_STATUS.EXPIRED]: 'gray',
  };
  return colorMap[normalized] || 'default';
};
