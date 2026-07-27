// Formats a Tanzania NIDA (National ID) number as the user types, into the
// standard grouping used on the physical ID card: YYYYMMDD-XXXXX-XXXXX-XX
// (8 digits - 5 digits - 5 digits - 2 digits = 20 digits total).
export function formatNida(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 20);
  const parts = [digits.slice(0, 8), digits.slice(8, 13), digits.slice(13, 18), digits.slice(18, 20)];
  return parts.filter(Boolean).join('-');
}

export const NIDA_PATTERN = /^\d{8}-\d{5}-\d{5}-\d{2}$/;
export const NIDA_PLACEHOLDER = '19960216-12104-00001-23';
