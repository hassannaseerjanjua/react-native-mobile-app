/**
 * Converts Arabic (٠-٩) and Persian (۰-۹) digits to Western (0-9).
 * Use for display-agnostic values: keep Arabic visible in fields, call this only when building API payloads/params.
 */
export const normalizeArabicDigits = (value: string): string => {
  if (!value) return value;
  return value
    .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 1776));
};

/**
 * Normalizes phone input for API: Arabic/Persian digits to Western, then strips +966 and non-digits.
 */
export const normalizePhoneNumber = (value: string): string => {
  const converted = normalizeArabicDigits(value || '');
  return converted
    .replace('+966', '')
    .replace(/\D/g, '');
};
