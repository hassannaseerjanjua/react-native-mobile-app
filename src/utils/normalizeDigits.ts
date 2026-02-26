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

const COUNTRY_CODE = '+966';

/**
 * Normalizes phone input for API: Arabic/Persian digits to Western, then strips non-digits.
 */
export const normalizePhoneNumber = (value: string): string => {
  const converted = normalizeArabicDigits(value || '');
  return converted.replace(/\D/g, '');
};

/**
 * Returns phone with +966 country code for API payloads (verify, sign in, sign up).
 */
export const formatPhoneWithCountryCode = (value: string): string => {
  const digits = normalizePhoneNumber(value);
  return digits ? `${COUNTRY_CODE}${digits}` : '';
};
