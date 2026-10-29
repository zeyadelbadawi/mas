import { parsePhoneNumberFromString } from "libphonenumber-js/min";

/** Normalise a phone number to E.164; Egyptian numbers may be typed locally (010…). Returns null if invalid. */
export function normalisePhone(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const parsed = parsePhoneNumberFromString(trimmed, "EG");
  return parsed?.isValid() ? parsed.number : null;
}

/** "+201012345678" → "+20 10 12345678" style display. */
export function displayPhone(e164: string): string {
  return parsePhoneNumberFromString(e164)?.formatInternational() ?? e164;
}
