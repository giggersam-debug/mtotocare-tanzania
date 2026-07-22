const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export interface RegisterChildPayload {
  fullName: string;
  dateOfBirth: string;
  sex: 'male' | 'female';
  birthWeightKg?: number;
  region?: string;
  district?: string;
  ward?: string;
  village?: string;
  guardian: {
    fullName: string;
    relation: 'mother' | 'father' | 'guardian';
    phone: string;
    whatsappOptIn?: boolean;
  };
}

export interface RegisterChildResponse {
  child: { childId: string; fullName: string; dateOfBirth: string; qrToken: string };
  qrCodeImage: string; // data: URL, ready to drop into an <img> tag
}

export async function registerChild(
  payload: RegisterChildPayload,
  accessToken: string,
): Promise<RegisterChildResponse> {
  const res = await fetch(`${API_BASE_URL}/children`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Could not register the child. Please try again.');
  }

  return res.json();
}

export interface ChildSummary {
  childId: string;
  fullName: string;
  dateOfBirth: string;
  sex: 'male' | 'female';
  guardianPhone?: string;
}

export async function lookupChildByQr(qrToken: string, accessToken: string): Promise<ChildSummary> {
  const res = await fetch(`${API_BASE_URL}/children/lookup/${encodeURIComponent(qrToken)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'No child found for that QR code.');
  }

  return res.json();
}

export interface ChildSearchResult {
  childId: string;
  fullName: string;
  dateOfBirth: string;
  sex: 'male' | 'female';
  region?: string;
  guardianPhone?: string;
}

export async function searchChildren(query: string, accessToken: string): Promise<ChildSearchResult[]> {
  const res = await fetch(`${API_BASE_URL}/children/search?q=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Search failed.');
  }

  return res.json();
}

export interface ChildProfile {
  childId: string;
  fullName: string;
  dateOfBirth: string;
  sex: 'male' | 'female';
  birthWeightKg?: number;
  birthHeightCm?: number;
  region?: string;
  district?: string;
  ward?: string;
  village?: string;
  guardian?: { fullName: string; relation: string; phone: string };
}

export async function getChildProfile(childId: string, accessToken: string): Promise<ChildProfile> {
  const res = await fetch(`${API_BASE_URL}/children/${childId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Could not load this child.');
  }

  return res.json();
}

export interface ScheduleEntry {
  code: string;
  label: string;
  dueDate: string;
  status: 'completed' | 'due' | 'overdue' | 'not_yet_due';
}

export async function getChildSchedule(childId: string, accessToken: string): Promise<ScheduleEntry[]> {
  const res = await fetch(`${API_BASE_URL}/children/${childId}/schedule`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Could not load the vaccination schedule.');
  }

  return res.json();
}

export const VACCINE_CODES = [
  'BCG',
  'OPV0',
  'OPV1',
  'OPV2',
  'OPV3',
  'PENTA1',
  'PENTA2',
  'PENTA3',
  'PCV1',
  'PCV2',
  'PCV3',
  'ROTA1',
  'ROTA2',
  'IPV',
  'MEASLES_RUBELLA1',
  'MEASLES_RUBELLA2',
  'VITAMIN_A',
  'YELLOW_FEVER',
  'HPV1',
  'HPV2',
] as const;

export interface RecordVaccinationPayload {
  childId: string;
  vaccineCode: (typeof VACCINE_CODES)[number];
  doseNumber?: number;
  administeredAt?: string;
  batchNumber?: string;
  notes?: string;
}

export interface VaccinationRecord {
  vaccinationId: string;
  vaccineCode: string;
  doseNumber?: number;
  administeredAt: string;
  batchNumber?: string;
  notes?: string;
  administeredByName?: string | null;
}

export async function recordVaccination(
  payload: RecordVaccinationPayload,
  accessToken: string,
): Promise<VaccinationRecord> {
  const res = await fetch(`${API_BASE_URL}/vaccinations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Could not record the vaccination. Please try again.');
  }

  return res.json();
}

export async function getVaccinationHistory(
  childId: string,
  accessToken: string,
): Promise<VaccinationRecord[]> {
  const res = await fetch(`${API_BASE_URL}/vaccinations/child/${childId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Could not load vaccination history.');
  }

  return res.json();
}

export interface UpdateVaccinationPayload {
  vaccineCode?: (typeof VACCINE_CODES)[number];
  doseNumber?: number;
  administeredAt?: string;
  batchNumber?: string;
  notes?: string;
}

export async function updateVaccination(
  vaccinationId: string,
  payload: UpdateVaccinationPayload,
  accessToken: string,
): Promise<VaccinationRecord> {
  const res = await fetch(`${API_BASE_URL}/vaccinations/${vaccinationId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Could not update the vaccination.');
  }

  return res.json();
}

export type NutritionalStatus = 'normal' | 'moderate_acute_malnutrition' | 'severe_acute_malnutrition';

export interface RecordGrowthPayload {
  childId: string;
  visitDate?: string;
  weightKg?: number;
  heightCm?: number;
  muacCm?: number;
  notes?: string;
}

export interface GrowthRecord {
  growthRecordId: string;
  visitDate: string;
  weightKg?: number;
  heightCm?: number;
  muacCm?: number;
  nutritionalStatus?: NutritionalStatus;
  notes?: string;
  recordedByName?: string | null;
}

export async function recordGrowth(payload: RecordGrowthPayload, accessToken: string): Promise<GrowthRecord> {
  const res = await fetch(`${API_BASE_URL}/growth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Could not record the measurement. Please try again.');
  }

  return res.json();
}

export async function getGrowthHistory(childId: string, accessToken: string): Promise<GrowthRecord[]> {
  const res = await fetch(`${API_BASE_URL}/growth/child/${childId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Could not load growth history.');
  }

  return res.json();
}

export interface UpdateGrowthPayload {
  visitDate?: string;
  weightKg?: number;
  heightCm?: number;
  muacCm?: number;
  notes?: string;
}

export async function updateGrowth(
  growthRecordId: string,
  payload: UpdateGrowthPayload,
  accessToken: string,
): Promise<GrowthRecord> {
  const res = await fetch(`${API_BASE_URL}/growth/${growthRecordId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Could not update the measurement.');
  }

  return res.json();
}

export interface DashboardSummary {
  facilityName: string | null;
  childrenRegistered: number;
  vaccinationsGiven: number;
  vaccinationsByVaccine: { vaccineCode: string; count: number }[];
  malnutritionRiskCount: number;
  overdueVaccinations: { childId: string; fullName: string; vaccineCode: string; dueSince: string }[];
}

export async function getDashboardSummary(accessToken: string): Promise<DashboardSummary> {
  const res = await fetch(`${API_BASE_URL}/dashboard/summary`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Could not load the dashboard.');
  }

  return res.json();
}

export interface ParentLookupResponse {
  child: {
    childId: string;
    fullName: string;
    dateOfBirth: string;
    sex: 'male' | 'female';
    whatsappOptIn: boolean;
  };
  vaccinations: VaccinationRecord[];
  growth: GrowthRecord[];
  schedule: ScheduleEntry[];
}

export async function parentLookup(qrToken: string, phone: string): Promise<ParentLookupResponse> {
  const res = await fetch(`${API_BASE_URL}/parent/lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qrToken, phone }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'We could not find a matching record.');
  }

  return res.json();
}

export interface PatientListEntry {
  childId: string;
  fullName: string;
  dateOfBirth: string;
  lastVisit: string | null;
  flags: string[];
}

export async function getPatientList(accessToken: string): Promise<PatientListEntry[]> {
  const res = await fetch(`${API_BASE_URL}/dashboard/patients`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Could not load the patient list.');
  }

  return res.json();
}

export interface LoginResponse {
  accessToken: string;
  user: { userId: string; fullName: string; role: string; facilityId?: string };
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Invalid username or password.');
  }

  return res.json();
}
