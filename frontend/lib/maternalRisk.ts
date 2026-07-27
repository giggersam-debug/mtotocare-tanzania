import type { MaternalHealthRecord } from './api';
import type { TranslationKey } from './i18n';

// Shared between the child profile and the mother profile — both render the
// same maternal health record, just reached via a different key (child vs
// guardian).
export function maternalRiskFlags(record: MaternalHealthRecord): TranslationKey[] {
  const flags: TranslationKey[] = [];
  if (record.hivStatus === 'positive') flags.push('risk_flag_hiv');
  if (record.gestationalDiabetes) flags.push('risk_flag_gdm');
  if (record.hypertension) flags.push('risk_flag_htn');
  if (record.anemia) flags.push('risk_flag_anemia');
  if (record.malariaInPregnancy) flags.push('risk_flag_malaria');
  if (record.apgarScore !== undefined && record.apgarScore !== null && record.apgarScore < 7) {
    flags.push('risk_flag_low_apgar');
  }
  if (record.deliveryComplications) flags.push('risk_flag_complications');
  if (record.geneticFamilyHistory) flags.push('risk_flag_genetic');
  return flags;
}
