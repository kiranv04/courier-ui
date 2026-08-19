/**
 * Validates Indian Aadhaar number format
 * Format: 12 digits, first digit 2-9 (never starts with 0 or 1)
 * Example: 234567890123
 */
export function isValidAadhaar(aadhaar) {
  if (!aadhaar) return false;
  const cleaned = aadhaar.trim().replace(/\s/g, "");
  const regex = /^[2-9]\d{11}$/;
  return regex.test(cleaned);
}

/**
 * Returns a validation message or null if valid
 */
export function aadhaarValidationMessage(aadhaar) {
  if (!aadhaar || !aadhaar.trim()) return null;
  const cleaned = aadhaar.trim().replace(/\s/g, "");
  if (cleaned.length !== 12) return "Aadhaar number must be exactly 12 digits";
  if (!isValidAadhaar(aadhaar)) return "Invalid Aadhaar number";
  return null;
}