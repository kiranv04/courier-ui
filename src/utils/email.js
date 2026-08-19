/**
 * Validates email address format
 * Example: name@example.com
 */
export function isValidEmail(email) {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

/**
 * Returns a validation message or null if valid
 */
export function emailValidationMessage(email) {
  if (!email || !email.trim()) return null;
  if (!isValidEmail(email)) return "Invalid email address";
  return null;
}