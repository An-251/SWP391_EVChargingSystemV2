import api from "../configs/config-axios";

/**
 * Invoice API Service - Postpaid Billing System
 * 
 * Flow:
 * 1. Driver completes charging sessions (unbilled, invoice = NULL)
 * 2. After 30 days, admin generates consolidated invoice for all unbilled sessions
 * 3. Driver receives notification and views invoice
 * 4. Driver pays invoice → Status: UNPAID → PAID
 * 5. If not paid within 7 days → OVERDUE → After 7 more days → Account SUSPENDED
 */

// ==================== DRIVER ENDPOINTS ====================

/**
 * Get all invoices for a driver with timeline information
 * @param {number} driverId - Driver ID
 * @returns {Promise} Array of invoices with timeline
 */
export const getDriverInvoices = async (driverId) => {
  try {
    const response = await api.get(`/invoices/driver/${driverId}`);
    // Backend returns { success, message, data: [...] }
    return response.data.data || [];
  } catch (error) {
    console.error("Failed to get driver invoices:", error);
    throw error;
  }
};

/**
 * Get only UNPAID invoices for a driver
 * @param {number} driverId - Driver ID
 * @returns {Promise} Array of unpaid invoices
 */
export const getUnpaidInvoices = async (driverId) => {
  try {
    const response = await api.get(`/invoices/driver/${driverId}/unpaid`);
    return response.data.data || [];
  } catch (error) {
    console.error("Failed to get unpaid invoices:", error);
    throw error;
  }
};

/**
 * Get only OVERDUE invoices for a driver
 * @param {number} driverId - Driver ID
 * @returns {Promise} Array of overdue invoices
 */
export const getOverdueInvoices = async (driverId) => {
  try {
    const response = await api.get(`/invoices/driver/${driverId}/overdue`);
    return response.data.data || [];
  } catch (error) {
    console.error("Failed to get overdue invoices:", error);
    throw error;
  }
};

/**
 * Get the most recent unpaid/overdue invoice for a driver
 * @param {number} driverId - Driver ID
 * @returns {Promise} Current invoice or null
 */
export const getCurrentInvoice = async (driverId) => {
  try {
    const response = await api.get(`/invoices/driver/${driverId}/current`);
    return response.data.data || null;
  } catch (error) {
    console.error("Failed to get current invoice:", error);
    throw error;
  }
};

/**
 * Check if driver needs to pay any invoices
 * @param {number} driverId - Driver ID
 * @returns {Promise<boolean>} True if has unpaid/overdue invoices
 */
export const needsPayment = async (driverId) => {
  try {
    const response = await api.get(`/invoices/driver/${driverId}/needs-payment`);
    return response.data.data || false;
  } catch (error) {
    console.error("Failed to check payment needs:", error);
    throw error;
  }
};

/**
 * Get detailed invoice information including sessions breakdown and timeline
 * @param {number} invoiceId - Invoice ID
 * @returns {Promise} Invoice detail with timeline
 */
export const getInvoiceDetail = async (invoiceId) => {
  try {
    const response = await api.get(`/invoices/${invoiceId}/detail`);
    return response.data.data || null;
  } catch (error) {
    console.error("Failed to get invoice detail:", error);
    throw error;
  }
};

/**
 * Get count of unbilled sessions for a driver
 * Used to show "You have X unbilled sessions" widget
 * @param {number} driverId - Driver ID
 * @returns {Promise<number>} Count of unbilled sessions
 */
export const getUnbilledSessionsCount = async (driverId) => {
  try {
    // Use check-ready endpoint which returns unbilledSessionCount
    const response = await api.get(`/invoices/admin/check-ready/${driverId}`);
    return response.data.unbilledSessionCount || 0;
  } catch (error) {
    console.error("Failed to get unbilled sessions count:", error);
    // Return 0 if error (user might not have any billing history yet)
    return 0;
  }
};

// ==================== ADMIN ENDPOINTS ====================

/**
 * Get list of drivers ready for invoice generation (30+ days with unbilled sessions)
 * @returns {Promise} Array of InvoiceReadyResponse
 */
export const getDriversReadyForBilling = async () => {
  try {
    const response = await api.get("/invoices/admin/drivers-ready");
    return response.data.data || [];
  } catch (error) {
    console.error("Failed to get drivers ready for billing:", error);
    throw error;
  }
};

/**
 * Check if specific driver is ready for invoice generation
 * @param {number} driverId - Driver ID
 * @returns {Promise} InvoiceReadyResponse with billing period info
 */
export const checkDriverReadiness = async (driverId) => {
  try {
    const response = await api.get(`/invoices/admin/check-ready/${driverId}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Failed to check driver readiness:", error);
    throw error;
  }
};

/**
 * Generate consolidated invoice for all unbilled sessions in a billing period
 * Main endpoint for admin to generate monthly invoices
 * @param {Object} params - { driverId, startDate, endDate }
 * @returns {Promise} Created invoice
 */
export const generateConsolidatedInvoice = async ({ driverId, startDate, endDate }) => {
  try {
    const response = await api.post("/invoices/admin/generate-consolidated", {
      driverId,
      startDate,
      endDate,
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error("Failed to generate consolidated invoice:", error);
    throw error;
  }
};

/**
 * Generate manual invoice for specific date range
 * Used for special cases or manual adjustments
 * @param {Object} params - { driverId, startDate, endDate, totalCost }
 * @returns {Promise} Created invoice
 */
export const generateManualInvoice = async ({ driverId, startDate, endDate, totalCost }) => {
  try {
    const response = await api.post("/invoices/admin/generate-manual", {
      driverId,
      startDate, // Format: "yyyy-MM-dd"
      endDate,   // Format: "yyyy-MM-dd"
      totalCost,
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error("Failed to generate manual invoice:", error);
    throw error;
  }
};

/**
 * Generate invoices for ALL drivers who are ready (30+ days with unbilled sessions)
 * Batch operation for end-of-month billing
 * @returns {Promise} Array of created invoices
 */
export const generateAllInvoices = async () => {
  try {
    const response = await api.post("/invoices/admin/generate-all");
    return response.data.data || response.data;
  } catch (error) {
    console.error("Failed to generate all invoices:", error);
    throw error;
  }
};

/**
 * Check and mark invoices as OVERDUE if past due date
 * Scheduled job endpoint (can be triggered manually)
 * @returns {Promise} Array of marked overdue invoices
 */
export const checkOverdueInvoices = async () => {
  try {
    const response = await api.post("/invoices/admin/check-overdue");
    return response.data.data || response.data;
  } catch (error) {
    console.error("Failed to check overdue invoices:", error);
    throw error;
  }
};

/**
 * Send payment reminder notifications to drivers with upcoming due dates
 * Scheduled job endpoint (can be triggered manually)
 * @returns {Promise} Result message
 */
export const sendPaymentReminders = async () => {
  try {
    const response = await api.post("/invoices/admin/send-reminders");
    return response.data.data || response.data;
  } catch (error) {
    console.error("Failed to send payment reminders:", error);
    throw error;
  }
};

/**
 * Check and suspend accounts with invoices past grace period
 * Scheduled job endpoint (can be triggered manually)
 * @returns {Promise} Result message
 */
export const checkSuspensions = async () => {
  try {
    const response = await api.post("/invoices/admin/check-suspensions");
    return response.data.data || response.data;
  } catch (error) {
    console.error("Failed to check suspensions:", error);
    throw error;
  }
};

/**
 * Get all invoices (admin view - all drivers)
 * @returns {Promise} Array of all invoices across all drivers
 */
export const getAllInvoices = async () => {
  try {
    const response = await api.get("/invoices/admin/all");
    return response.data.data || [];
  } catch (error) {
    console.error("Failed to get all invoices:", error);
    throw error;
  }
};

export default {
  // Driver APIs
  getDriverInvoices,
  getUnpaidInvoices,
  getOverdueInvoices,
  getCurrentInvoice,
  needsPayment,
  getInvoiceDetail,
  getUnbilledSessionsCount,
  
  // Admin APIs
  getDriversReadyForBilling,
  checkDriverReadiness,
  generateConsolidatedInvoice,
  generateManualInvoice,
  generateAllInvoices,
  checkOverdueInvoices,
  sendPaymentReminders,
  checkSuspensions,
  getAllInvoices,
};
