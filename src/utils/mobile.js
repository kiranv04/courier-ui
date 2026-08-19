/**
 * Validates Indian mobile number format
 * Format: 10 digits, first digit 6-9
 * Example: 9876543210
 */
export function isValidMobile(mobile) {
  if (!mobile) return false;
  const regex = /^[6-9]\d{9}$/;
  return regex.test(mobile.trim());
}

/**
 * Returns a validation message or null if valid
 */
export function mobileValidationMessage(mobile) {
  if (!mobile || !mobile.trim()) return null;
  if (mobile.trim().length !== 10) return "Mobile number must be exactly 10 digits";
  if (!isValidMobile(mobile)) return "Invalid mobile number (must start with 6-9)";
  return null;
}