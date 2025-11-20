/**
 * Format số tiền VND - chỉ hiển thị số nguyên, không có số thập phân
 * @param {number|string} amount - Số tiền cần format
 * @returns {string} - Số tiền đã format (VD: "50,000")
 */
export const formatVND = (amount) => {
  if (!amount && amount !== 0) return '0';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return Math.round(numAmount).toLocaleString('vi-VN');
};

/**
 * Format số tiền VND với đơn vị đ
 * @param {number|string} amount - Số tiền cần format
 * @returns {string} - Số tiền đã format với đơn vị (VD: "50,000 đ")
 */
export const formatVNDWithUnit = (amount) => {
  return `${formatVND(amount)} đ`;
};

/**
 * Format kWh - giữ 2 số thập phân
 * @param {number|string} kwh - Số kWh cần format
 * @returns {string} - kWh đã format (VD: "10.50")
 */
export const formatKWh = (kwh) => {
  if (!kwh && kwh !== 0) return '0.00';
  const numKwh = typeof kwh === 'string' ? parseFloat(kwh) : kwh;
  return numKwh.toFixed(2);
};

/**
 * Format phần trăm - không có số thập phân
 * @param {number|string} percent - Phần trăm cần format
 * @returns {string} - Phần trăm đã format (VD: "85%")
 */
export const formatPercent = (percent) => {
  if (!percent && percent !== 0) return '0%';
  const numPercent = typeof percent === 'string' ? parseFloat(percent) : percent;
  return `${Math.round(numPercent)}%`;
};

/**
 * Format thời gian (phút) - chỉ số nguyên
 * @param {number|string} minutes - Số phút cần format
 * @returns {number} - Số phút dạng integer
 */
export const formatTime = (minutes) => {
  if (!minutes && minutes !== 0) return 0;
  const numMinutes = typeof minutes === 'string' ? parseFloat(minutes) : minutes;
  return Math.round(numMinutes);
};
