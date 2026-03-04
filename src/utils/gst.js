/**
 * Validates Indian GST number format
 * Format: 2-digit state code + PAN (10 chars) + entity number + Z + checksum
 * Example: 29ATSPV0692C1Z3
 */
export function isValidGST(gst) {
  if (!gst) return false;
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return regex.test(gst.trim().toUpperCase());
}

/**
 * Returns a validation message or null if valid
 */
export function gstValidationMessage(gst) {
  if (!gst || !gst.trim()) return null;
  if (gst.trim().length !== 15) return "GST number must be exactly 15 characters";
  if (!isValidGST(gst)) return "Invalid GST format (e.g. 29ATSPV0692C1Z3)";
  return null;
}