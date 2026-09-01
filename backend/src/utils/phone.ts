// Normalizes Nigerian phone numbers to a canonical "234XXXXXXXXXX" digit
// string, so +234..., 234..., and 0... all resolve to the same value for
// storage and lookup.
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
}

// Canonical storage form, e.g. "+2348012345678". Returns undefined for
// empty/missing input so callers can omit the field entirely.
export function toStoredPhone(raw?: string): string | undefined {
  if (!raw?.trim()) return undefined;
  const normalized = normalizePhone(raw);
  return normalized ? `+${normalized}` : undefined;
}
