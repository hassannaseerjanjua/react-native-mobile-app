import { normalizeArabicDigits } from './normalizeDigits';

/** Always Western digits and grouping (e.g. 1,234.56); independent of app UI language. */
const DISPLAY_NUMBER_LOCALE = 'en-US';

const intlOptions = {
  numberingSystem: 'latn' as const,
};

function tryParseNumericString(raw: string): number | null {
  const trimmed = normalizeArabicDigits(raw.trim());
  if (!trimmed || trimmed.toUpperCase() === 'N/A') return null;
  const cleaned = trimmed
    .replace(/,/g, '')
    .replace(/\u00A0/g, '')
    .replace(/\s/g, '');
  if (!/^-?\d*\.?\d+(?:[eE][+-]?\d+)?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function formatGroupedInteger(value: number): string {
  if (!Number.isFinite(value)) return String(value);
  return new Intl.NumberFormat(DISPLAY_NUMBER_LOCALE, {
    ...intlOptions,
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(value);
}

/**
 * Formats numeric amounts for display (grouping + up to 2 fraction digits).
 * Non-numeric strings are returned unchanged (e.g. placeholders, "N/A").
 */
export function formatNumericValueForDisplay(value: number | string): string {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return String(value);
    return new Intl.NumberFormat(DISPLAY_NUMBER_LOCALE, {
      ...intlOptions,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(value);
  }
  const parsed = tryParseNumericString(value);
  if (parsed === null) return value;
  return new Intl.NumberFormat(DISPLAY_NUMBER_LOCALE, {
    ...intlOptions,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(parsed);
}
