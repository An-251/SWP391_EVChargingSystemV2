import axiosInstance from "../configs/config-axios";

/**
 * API Service cho Subscription Plans
 */

// Get all subscription plans
export const getAllSubscriptionPlans = async () => {
  try {
    const response = await axiosInstance.get('/api/subscriptions');
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }
};

// Get subscription plan by ID
export const getSubscriptionPlanById = async (planId) => {
  try {
    const response = await axiosInstance.get(`/api/subscriptions/${planId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription plan:', error);
    throw error;
  }
};

// Get default/basic plan
export const getDefaultPlan = async () => {
  try {
    const response = await axiosInstance.get('/api/subscriptions');
    const plans = response.data?.data || response.data;
    
    // Find Basic plan or plan with isDefault = true
    const defaultPlan = plans.find(plan => 
      plan.isDefault === true || 
      plan.planName?.toLowerCase().includes('basic') ||
      plan.planType?.toLowerCase().includes('basic')
    );
    
    return defaultPlan || plans[0]; // Return first plan if no basic found
  } catch (error) {
    console.error('Error fetching default plan:', error);
    throw error;
  }
};

/**
 * Register driver to a subscription plan
 * @param {number} driverId - Driver ID
 * @param {number} planId - Plan ID
 */
export const registerDriverPlan = async (driverId, planId) => {
  try {
    const response = await axiosInstance.post('/api/driver/subscriptions/register', {
      driverId,
      planId,
    });
    return response.data;
  } catch (error) {
    console.error('Error registering driver plan:', error);
    throw error;
  }
};

/**
 * Auto-assign Basic plan to new driver
 * This should be called after driver registration
 */
export const assignBasicPlanToDriver = async (driverId) => {
  try {
    // Get default/basic plan first
    const basicPlan = await getDefaultPlan();
    
    if (!basicPlan || !basicPlan.id) {
      throw new Error('Không tìm thấy gói Basic');
    }

    // Register driver to basic plan
    const response = await registerDriverPlan(driverId, basicPlan.id);
    return response;
  } catch (error) {
    console.error('Error assigning basic plan to driver:', error);
    throw error;
  }
};

// Get driver's current subscription
export const getDriverCurrentSubscription = async (driverId) => {
  try {
    const response = await axiosInstance.get('/api/driver/subscriptions/my-subscription', {
      params: { driverId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching driver subscription:', error);
    throw error;
  }
};

// Get driver's subscription history
export const getDriverSubscriptionHistory = async (driverId) => {
  try {
    const response = await axiosInstance.get('/api/driver/subscriptions/history', {
      params: { driverId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription history:', error);
    throw error;
  }
};

// Cancel driver subscription
export const cancelDriverSubscription = async (driverId) => {
  try {
    const response = await axiosInstance.put('/api/driver/subscriptions/cancel', null, {
      params: { driverId }
    });
    return response.data;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};

/**
 * Generate QR Code for driver verification
 * This creates a QR code string that can be scanned before charging
 */
export const generateDriverQRCode = (driverId) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const qrData = `EV_CHARGING|DRIVER|${driverId}|${timestamp}`;
  
  // Encode to base64 (matching BE format)
  return btoa(qrData);
};

/**
 * Verify scanned QR Code
 * @param {string} qrCode - Scanned QR code (base64 encoded)
 * @param {number} expectedDriverId - Expected driver ID (optional)
 */
export const verifyDriverQRCode = (qrCode, expectedDriverId = null) => {
  try {
    // Decode base64
    const decoded = atob(qrCode);
    const parts = decoded.split('|');

    // Validate format: EV_CHARGING|DRIVER|{driverId}|{timestamp}
    if (parts.length !== 4 || parts[0] !== 'EV_CHARGING' || parts[1] !== 'DRIVER') {
      return {
        valid: false,
        error: 'Mã QR không hợp lệ',
      };
    }

    const driverId = parseInt(parts[2]);
    const timestamp = parseInt(parts[3]);

    // Check if expired (24 hours)
    const now = Math.floor(Date.now() / 1000);
    if (now - timestamp > 86400) {
      return {
        valid: false,
        error: 'Mã QR đã hết hạn',
      };
    }

    // Check driver ID match if provided
    if (expectedDriverId && driverId !== expectedDriverId) {
      return {
        valid: false,
        error: 'Mã QR không khớp với tài khoản',
      };
    }

    return {
      valid: true,
      driverId,
      timestamp,
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Không thể đọc mã QR',
    };
  }
};

export default {
  getAllSubscriptionPlans,
  getSubscriptionPlanById,
  getDefaultPlan,
  registerDriverPlan,
  assignBasicPlanToDriver,
  getDriverCurrentSubscription,
  getDriverSubscriptionHistory,
  cancelDriverSubscription,
  generateDriverQRCode,
  verifyDriverQRCode,
};
