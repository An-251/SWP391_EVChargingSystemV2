import api from "../configs/config-axios";

/**
 * Payment API Service - Invoice Payment Operations
 * 
 * Flow:
 * 1. Driver views invoice and payment timeline
 * 2. Driver selects payment method (CASH, CARD, EWALLET)
 * 3. Payment is processed
 * 4. Invoice status updated: UNPAID → PAID
 * 5. Account remains ACTIVE (no suspension)
 */

// ==================== PAYMENT ENDPOINTS ====================

/**
 * Pay an invoice with selected payment method
 * @param {Object} params - { invoiceId, paymentMethod }
 * @returns {Promise} PaymentResponse with updated invoice
 */
export const payInvoice = async ({ invoiceId, paymentMethod }) => {
  try {
    const response = await api.post("/payments/pay", {
      invoiceId,
      paymentMethod, // "CASH", "CARD", or "EWALLET"
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error("Failed to pay invoice:", error);
    throw error;
  }
};

/**
 * Get payment timeline for an invoice
 * Shows: Days until due, days in grace period, days until suspension
 * @param {number} invoiceId - Invoice ID
 * @returns {Promise} PaymentTimeline object
 */
export const getPaymentTimeline = async (invoiceId) => {
  try {
    const response = await api.get(`/payments/timeline/${invoiceId}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Failed to get payment timeline:", error);
    throw error;
  }
};

/**
 * Get all pending invoices (UNPAID + OVERDUE) for a driver
 * Sorted by due date (oldest first)
 * @param {number} driverId - Driver ID
 * @returns {Promise} Array of pending invoices
 */
export const getPendingInvoices = async (driverId) => {
  try {
    const response = await api.get(`/payments/pending/${driverId}`);
    return response.data.data || [];
  } catch (error) {
    console.error("Failed to get pending invoices:", error);
    throw error;
  }
};

/**
 * Check if an invoice is overdue and by how many days
 * @param {number} invoiceId - Invoice ID
 * @returns {Promise} OverdueCheckResponse { isOverdue, daysOverdue }
 */
export const checkOverdue = async (invoiceId) => {
  try {
    const response = await api.get(`/payments/check-overdue/${invoiceId}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Failed to check overdue status:", error);
    throw error;
  }
};

/**
 * Check if an invoice is in the 7-day grace period
 * Grace period = 7 days after due date before account suspension
 * @param {number} invoiceId - Invoice ID
 * @returns {Promise} GracePeriodCheckResponse { inGracePeriod, daysRemainingInGrace }
 */
export const checkGracePeriod = async (invoiceId) => {
  try {
    const response = await api.get(`/payments/check-grace-period/${invoiceId}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Failed to check grace period:", error);
    throw error;
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Format payment method for display
 * @param {string} method - Payment method code
 * @returns {string} Formatted display name
 */
export const formatPaymentMethod = (method) => {
  const methods = {
    CASH: "Tiền mặt",
    CARD: "Thẻ ngân hàng",
    EWALLET: "Ví điện tử",
  };
  return methods[method] || method;
};

/**
 * Calculate payment urgency level based on timeline
 * @param {Object} timeline - PaymentTimeline object
 * @returns {string} Urgency level: "safe", "warning", "danger", "critical"
 */
export const calculateUrgency = (timeline) => {
  if (!timeline) return "safe";
  
  if (timeline.daysUntilSuspension !== null && timeline.daysUntilSuspension <= 2) {
    return "critical"; // About to be suspended
  }
  
  if (timeline.daysInGracePeriod !== null) {
    return "danger"; // In grace period (already overdue)
  }
  
  if (timeline.daysUntilDue !== null && timeline.daysUntilDue <= 2) {
    return "warning"; // Due soon
  }
  
  return "safe";
};

/**
 * Get urgency message based on timeline
 * @param {Object} timeline - PaymentTimeline object
 * @returns {string} Urgency message
 */
export const getUrgencyMessage = (timeline) => {
  if (!timeline) return "";
  
  if (timeline.daysUntilSuspension !== null && timeline.daysUntilSuspension <= 0) {
    return "⚠️ TÀI KHOẢN ĐANG BỊ TẠM KHÓA - Vui lòng thanh toán ngay để kích hoạt lại";
  }
  
  if (timeline.daysUntilSuspension !== null && timeline.daysUntilSuspension <= 2) {
    return `🚨 TÀI KHOẢN SẼ BỊ KHÓA SAU ${timeline.daysUntilSuspension} NGÀY - Thanh toán ngay!`;
  }
  
  if (timeline.daysInGracePeriod !== null) {
    return `⚠️ HÓA ĐƠN QUÁ HẠN - Còn ${timeline.daysInGracePeriod} ngày trước khi tài khoản bị khóa`;
  }
  
  if (timeline.daysUntilDue !== null && timeline.daysUntilDue <= 2) {
    return `⏰ SẮP ĐẾN HẠN - Còn ${timeline.daysUntilDue} ngày để thanh toán`;
  }
  
  if (timeline.daysUntilDue !== null) {
    return `📅 Còn ${timeline.daysUntilDue} ngày đến hạn thanh toán`;
  }
  
  return "";
};

/**
 * Get status color for UI
 * @param {string} status - Invoice status
 * @returns {string} Tailwind color class
 */
export const getStatusColor = (status) => {
  const normalizedStatus = status?.toLowerCase();
  const colors = {
    paid: "green",
    unpaid: "yellow",
    overdue: "red",
  };
  return colors[normalizedStatus] || "gray";
};

/**
 * Get status badge text
 * @param {string} status - Invoice status
 * @returns {string} Display text
 */
export const getStatusText = (status) => {
  const normalizedStatus = status?.toLowerCase();
  const texts = {
    paid: "Đã thanh toán",
    unpaid: "Chưa thanh toán",
    overdue: "Quá hạn",
  };
  return texts[normalizedStatus] || status;
};

export default {
  payInvoice,
  getPaymentTimeline,
  getPendingInvoices,
  checkOverdue,
  checkGracePeriod,
  
  // Helper functions
  formatPaymentMethod,
  calculateUrgency,
  getUrgencyMessage,
  getStatusColor,
  getStatusText,
};
