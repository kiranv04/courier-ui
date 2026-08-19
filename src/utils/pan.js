/**
 * Validates Indian PAN number format
 * Format: 5 letters + 4 digits + 1 letter
 * Example: ATSPV0692C
 */
export function isValidPAN(pan) {
  if (!pan) return false;
  const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return regex.test(pan.trim().toUpperCase());
}

/**
 * Returns a validation message or null if valid
 */
export function panValidationMessage(pan) {
  if (!pan || !pan.trim()) return null;
  if (pan.trim().length !== 10) return "PAN must be exactly 10 characters";
  if (!isValidPAN(pan)) return "Invalid PAN format (e.g. ATSPV0692C)";
  return null;
}