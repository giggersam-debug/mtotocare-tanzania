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
