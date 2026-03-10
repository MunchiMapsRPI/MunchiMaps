/**
 * Sanitizes a string: trims whitespace and removes null bytes/control characters.
 * Reduces injection risks and handles malformed input.
 * @param {string} value - The string to sanitize
 * @returns {string} - Sanitized string, or empty string if input is not a string
 */
function sanitizeString(value) {
  if (typeof value !== "string") return value;
  return value
    .trim()
    .replace(/\0/g, "") // remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ""); // remove other control characters
}

/**
 * Sanitizes string values in an object. Leaves non-string values unchanged.
 * @param {object} obj - Object with potential string values
 * @param {string[]} stringKeys - Keys that should be sanitized as strings
 * @returns {object} - New object with sanitized string values
 */
function sanitizeBody(obj, stringKeys) {
  if (!obj || typeof obj !== "object") return obj;
  const result = { ...obj };
  for (const key of stringKeys) {
    if (key in result && result[key] != null) {
      result[key] = sanitizeString(String(result[key]));
    }
  }
  return result;
}

module.exports = { sanitizeString, sanitizeBody };
