/** Normalize supported phone input to E.164 for storage and duplicate checks. */
export function normalizePhoneNumber(value: string | null | undefined): string | null {
  const input = value?.trim();
  if (!input) return null;

  const digits = input.replace(/\D/g, "");
  let normalized: string;

  if (input.startsWith("+")) {
    normalized = `+${digits}`;
  } else if (digits.startsWith("00")) {
    normalized = `+${digits.slice(2)}`;
  } else if (digits.length === 10) {
    // The app defaults to India; local ten-digit entries are treated as +91.
    normalized = `+91${digits}`;
  } else if (digits.startsWith("91") && digits.length === 12) {
    normalized = `+${digits}`;
  } else {
    return null;
  }

  return /^\+[1-9]\d{7,14}$/.test(normalized) ? normalized : null;
}
