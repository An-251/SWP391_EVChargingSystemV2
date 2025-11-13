/**
 * Status Constants for EV Charging System
 * Đồng bộ với Backend definitions
 */

// ==================== CHARGING POINT STATUS ====================
export const CHARGING_POINT_STATUS = {
  MAINTENANCE: 'maintenance',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BOOKED: 'booked',
  USING: 'using'
};

// ==================== RESERVATION STATUS ====================
export const RESERVATION_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  FULFILLED: 'fulfilled'
};

// ==================== SESSION STATUS ====================
export const SESSION_STATUS = {
  CHARGING: 'charging',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
  INTERRUPTED: 'interrupted'
};
