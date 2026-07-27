import type { TranslationKey } from './i18n';

// Shared "recorded by X at Y" line used across vaccination/growth/antenatal
// visit history lists.
export function recorderMeta(
  name: string | null | undefined,
  phone: string | null | undefined,
  employeeNumber: string | null | undefined,
  facility: string | null | undefined,
  t: (key: TranslationKey) => string,
): string | null {
  if (!name) return null;
  const parts = [`${t('record_recorded_by')} ${name}`];
  if (phone) parts.push(phone);
  if (employeeNumber) parts.push(`${t('record_employee_no')} ${employeeNumber}`);
  if (facility) parts.push(`${t('record_at_facility')} ${facility}`);
  return parts.join(' · ');
}
