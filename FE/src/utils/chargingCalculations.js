/**
 * ⚡ CHARGING CALCULATION UTILITIES
 * 
 * Thống nhất công thức tính toán charging giữa FE và BE
 * 
 * BE FORMULA (ChargingSessionService.java):
 * - kwhUsed = (endPercentage - startPercentage) * batteryCapacity / 100
 * - baseCost = kwhUsed * chargingPoint.pricePerKwh
 * - energyCostWithDiscount = baseCost - (baseCost * plan.discountRate / 100)
 * - finalCost = START_FEE + energyCostWithDiscount + overusePenalty
 * 
 * ⭐ IMPORTANT: Discount CHỈ áp dụng cho điện năng (baseCost)
 * ⭐ Start Fee và Overuse Penalty KHÔNG được giảm giá
 * 
 * FE chỉ dùng để ESTIMATE trước khi start/stop session.
 * Cost chính thức luôn lấy từ BE response!
 */

// ==================== BE CONSTANTS (MUST MATCH Backend) ====================
export const CHARGING_CONSTANTS = {
  /**
   * DEFAULT_BATTERY_CAPACITY: Dung lượng pin mặc định (kWh) nếu không có data
   * Chỉ dùng khi vehicle.batteryCapacity không có
   */
  DEFAULT_BATTERY_CAPACITY: 60, // kWh

  /**
   * DEFAULT_COST_PER_KWH: Giá tiền mặc định mỗi kWh (VND)
   * Chỉ dùng khi chargingPoint.pricePerKwh không có
   */
  DEFAULT_COST_PER_KWH: 3000, // VND/kWh

  /**
   * DEFAULT_CHARGING_POWER: Công suất sạc mặc định (kW)
   * Dùng để tính thời gian ước tính nếu không có data
   */
  DEFAULT_CHARGING_POWER: 50, // kW
  
  /**
   * @deprecated KWH_PER_PERCENT - Không dùng nữa!
   * Thay vào đó dùng: (batteryCapacity / 100) để tính kWh per percent
   */
  KWH_PER_PERCENT: 0.5, // DEPRECATED - for backward compatibility only
};

/**
 * Tính toán ước lượng charging session
 * 
 * @param {Object} params - Calculation parameters
 * @param {number} params.startPercentage - % pin ban đầu (0-100)
 * @param {number} params.endPercentage - % pin mục tiêu (0-100)
 * @param {number} params.batteryCapacity - Dung lượng pin xe (kWh) - ⭐ REQUIRED from vehicle
 * @param {number} params.pricePerKwh - Giá tiền mỗi kWh (VND) - ⭐ REQUIRED from charging point
 * @param {number} params.chargingPower - Công suất sạc (kW), default 50kW
 * @param {number} params.discountRate - Discount từ subscription plan (%), default 0
 * 
 * @returns {Object} Estimation results
 * @returns {number} kwhNeeded - Số kWh cần sạc (based on real battery capacity)
 * @returns {number} estimatedTimeMinutes - Thời gian ước tính (phút)
 * @returns {number} baseCost - Chi phí điện năng trước discount (VND)
 * @returns {number} discount - Số tiền giảm (VND) - CHỈ cho điện năng
 * @returns {number} finalCost - Chi phí điện năng sau discount (VND) - KHÔNG bao gồm start fee
 * 
 * ⭐ NOTE: finalCost CHỈ là điện năng sau discount. Component cần cộng thêm START_FEE (5000đ)
 * 
 * @example
 * const result = calculateChargingEstimate({
 *   startPercentage: 20,
 *   endPercentage: 80,
 *   batteryCapacity: 75, // Tesla Model 3 LR
 *   pricePerKwh: 3500,
 *   chargingPower: 50,
 *   discountRate: 25
 * });
 * // Result: { kwhNeeded: 45, estimatedTimeMinutes: 54, baseCost: 157500, discount: 39375, finalCost: 118125 }
 * // Component phải cộng: START_FEE (5000) + finalCost (118125) = 123125 đ
 */
export function calculateChargingEstimate({
  startPercentage,
  endPercentage,
  batteryCapacity = CHARGING_CONSTANTS.DEFAULT_BATTERY_CAPACITY,
  pricePerKwh = CHARGING_CONSTANTS.DEFAULT_COST_PER_KWH,
  chargingPower = CHARGING_CONSTANTS.DEFAULT_CHARGING_POWER,
  discountRate = 0,
}) {
  // Validate inputs
  if (startPercentage < 0 || startPercentage > 100) {
    throw new Error('startPercentage must be between 0-100');
  }
  if (endPercentage < 0 || endPercentage > 100) {
    throw new Error('endPercentage must be between 0-100');
  }
  if (endPercentage <= startPercentage) {
    throw new Error('endPercentage must be greater than startPercentage');
  }
  if (chargingPower <= 0) {
    throw new Error('chargingPower must be positive');
  }
  if (discountRate < 0 || discountRate > 100) {
    throw new Error('discountRate must be between 0-100');
  }

  // Validate batteryCapacity and pricePerKwh
  if (batteryCapacity <= 0) {
    throw new Error('batteryCapacity must be positive');
  }
  if (pricePerKwh <= 0) {
    throw new Error('pricePerKwh must be positive');
  }

  // 1. Tính số % cần sạc
  const percentageDiff = endPercentage - startPercentage;

  // 2. Tính kWh cần thiết (MATCH BE FORMULA - UPDATED)
  // ⭐ NEW: BE formula = (percentageCharged / 100) * batteryCapacity
  // OLD (deprecated): kwhUsed = percentageCharged * 0.5
  const kwhNeeded = (percentageDiff / 100) * batteryCapacity;

  // 3. Tính thời gian ước tính (phút)
  // Formula: time (hours) = kWh / kW → time (minutes) = (kWh / kW) * 60
  const estimatedTimeMinutes = (kwhNeeded / chargingPower) * 60;

  // 4. Tính giá gốc điện năng (MATCH BE FORMULA)
  // ⭐ BE formula = kwhUsed * chargingPoint.pricePerKwh
  const baseCost = kwhNeeded * pricePerKwh;

  // 5. Tính discount - CHỈ áp dụng cho điện năng (MATCH BE FORMULA)
  // ⭐ BE: Discount CHỈ áp dụng cho baseCost, KHÔNG áp dụng cho startFee và overusePenalty
  // BE: BigDecimal discountAmount = baseCost.multiply(plan.getDiscountRate()).divide(BigDecimal.valueOf(100))
  const discount = (baseCost * discountRate) / 100;

  // 6. Tính giá cuối cùng - Điện năng sau giảm giá
  // ⭐ NOTE: finalCost ở đây CHỈ là điện năng sau discount
  // Start fee và overuse penalty sẽ được cộng thêm ở component
  const energyCostAfterDiscount = baseCost - discount;

  return {
    kwhNeeded: Math.round(kwhNeeded * 100) / 100, // Round to 2 decimals
    estimatedTimeMinutes: Math.round(estimatedTimeMinutes),
    baseCost: Math.round(baseCost), // Chi phí điện năng trước discount
    discount: Math.round(discount), // Số tiền giảm (chỉ cho điện năng)
    finalCost: Math.round(energyCostAfterDiscount), // Điện năng sau discount
    percentageDiff,
  };
}

/**
 * Format currency to Vietnamese Dong
 * @param {number} amount - Amount in VND
 * @returns {string} Formatted string (e.g., "90.000 VNĐ")
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '0 VNĐ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Format duration in minutes to human-readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted string (e.g., "1 giờ 30 phút" or "45 phút")
 */
export function formatDuration(minutes) {
  if (!minutes || minutes < 0) return '0 phút';
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (hours > 0 && mins > 0) {
    return `${hours} giờ ${mins} phút`;
  } else if (hours > 0) {
    return `${hours} giờ`;
  } else {
    return `${mins} phút`;
  }
}

/**
 * Format kWh to readable string
 * @param {number} kwh - Energy in kWh
 * @returns {string} Formatted string (e.g., "30.5 kWh")
 */
export function formatKwh(kwh) {
  if (kwh === null || kwh === undefined) return '0 kWh';
  return `${Math.round(kwh * 100) / 100} kWh`;
}

/**
 * Validate battery percentage input
 * @param {number} percentage - Battery percentage to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateBatteryPercentage(percentage) {
  if (percentage === null || percentage === undefined) {
    return { valid: false, error: 'Vui lòng nhập % pin' };
  }
  if (percentage < 0 || percentage > 100) {
    return { valid: false, error: '% pin phải từ 0-100' };
  }
  return { valid: true, error: null };
}

/**
 * Validate charging range (start -> end percentage)
 * @param {number} startPercentage - Starting battery %
 * @param {number} endPercentage - Target battery %
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateChargingRange(startPercentage, endPercentage) {
  const startValidation = validateBatteryPercentage(startPercentage);
  if (!startValidation.valid) {
    return { valid: false, error: `% pin bắt đầu: ${startValidation.error}` };
  }

  const endValidation = validateBatteryPercentage(endPercentage);
  if (!endValidation.valid) {
    return { valid: false, error: `% pin kết thúc: ${endValidation.error}` };
  }

  if (endPercentage <= startPercentage) {
    return { valid: false, error: '% pin kết thúc phải lớn hơn % pin bắt đầu' };
  }

  const diff = endPercentage - startPercentage;
  if (diff < 5) {
    return { valid: false, error: 'Cần sạc ít nhất 5%' };
  }

  return { valid: true, error: null };
}

/**
 * Get active subscription discount rate
 * @param {Object} subscription - Subscription object from API
 * @returns {number} Discount rate (0-100)
 */
export function getSubscriptionDiscountRate(subscription) {
  if (!subscription || !subscription.plan) return 0;
  
  // Check if subscription is active
  const now = new Date();
  const startDate = new Date(subscription.startDate);
  const endDate = new Date(subscription.endDate);
  
  if (now < startDate || now > endDate) return 0;
  
  return subscription.plan.discountRate || 0;
}

// Export all utilities
export default {
  CHARGING_CONSTANTS,
  calculateChargingEstimate,
  formatCurrency,
  formatDuration,
  formatKwh,
  validateBatteryPercentage,
  validateChargingRange,
  getSubscriptionDiscountRate,
};
