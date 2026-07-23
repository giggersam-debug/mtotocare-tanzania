'use client';

import { useEffect, useState, type FormEvent } from 'react';
import {
  createFacility,
  createStaff,
  listFacilities,
  listStaff,
  setStaffActive,
  type CreateFacilityPayload,
  type CreateStaffPayload,
  type Facility,
  type StaffSummary,
} from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

const STAFF_ROLES: CreateStaffPayload['role'][] = ['nurse', 'doctor', 'nutritionist', 'pharmacist'];
const FACILITY_LEVELS: Facility['level'][] = ['dispensary', 'health_centre', 'hospital'];

export function SettingsPanel({ accessToken }: { accessToken: string }) {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <StaffSection accessToken={accessToken} />
      <FacilitiesSection accessToken={accessToken} />
    </div>
  );
}

function StaffSection({ accessToken }: { accessToken: string }) {
  const { t } = useLanguage();
  const [staff, setStaff] = useState<StaffSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateStaffPayload>({
    username: '',
    password: '',
    fullName: '',
    phone: '',
    employeeNumber: '',
    role: 'nurse',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function reload() {
    setLoading(true);
    listStaff(accessToken)
      .then(setStaff)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load staff.'))
      .finally(() => setLoading(false));
  }

  useEffect(reload, [accessToken]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await createStaff(form, accessToken);
      setForm({ username: '', password: '', fullName: '', phone: '', employeeNumber: '', role: 'nurse' });
      setShowForm(false);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not create the account.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(member: StaffSummary) {
    try {
      await setStaffActive(member.userId, !member.isActive, accessToken);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the account.');
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">{t('st_staff_accounts')}</h2>
        <button onClick={() => setShowForm((v) => !v)} className="btn-secondary w-auto px-4 py-1.5 text-xs">
          {showForm ? t('st_cancel') : t('st_add_staff')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-5 space-y-3 rounded-xl bg-slate-50 p-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              className="input"
              placeholder={t('st_full_name')}
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
            <select
              className="input"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as CreateStaffPayload['role'] })}
            >
              {STAFF_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <input
              className="input"
              placeholder={t('st_username')}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
            <input
              className="input"
              placeholder={t('st_phone_placeholder')}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <input
              className="input"
              placeholder={t('st_employee_number_placeholder')}
              value={form.employeeNumber}
              onChange={(e) => setForm({ ...form, employeeNumber: e.target.value })}
              required
            />
            <input
              className="input"
              type="password"
              placeholder={t('st_temp_password')}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          {formError && <p className="text-sm font-medium text-red-600">{formError}</p>}
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? t('st_creating') : t('st_create_account')}
          </button>
        </form>
      )}

      {loading && <p className="text-center text-sm text-slate-400">{t('common_loading')}</p>}
      {error && <p className="text-center text-sm font-medium text-red-600">{error}</p>}

      {!loading && !error && (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="py-2">{t('st_col_name')}</th>
              <th className="py-2">{t('st_username')}</th>
              <th className="py-2">{t('st_col_phone')}</th>
              <th className="py-2">{t('st_col_employee_number')}</th>
              <th className="py-2">{t('st_col_role')}</th>
              <th className="py-2">{t('st_col_facility')}</th>
              <th className="py-2">{t('st_col_status')}</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.userId} className="border-b border-slate-50 last:border-0">
                <td className="py-2 font-semibold text-slate-700">{member.fullName}</td>
                <td className="py-2 text-slate-500">{member.username}</td>
                <td className="py-2 text-slate-500">{member.phone ?? '—'}</td>
                <td className="py-2 text-slate-500">{member.employeeNumber ?? '—'}</td>
                <td className="py-2 text-slate-500">{member.role}</td>
                <td className="py-2 text-slate-500">{member.facilityName ?? '—'}</td>
                <td className="py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      member.isActive ? 'bg-green/10 text-green' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {member.isActive ? t('st_active') : t('st_deactivated')}
                  </span>
                </td>
                <td className="py-2 text-right">
                  <button
                    onClick={() => handleToggleActive(member)}
                    className="text-xs font-semibold text-blue hover:underline"
                  >
                    {member.isActive ? t('st_deactivate') : t('st_reactivate')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function FacilitiesSection({ accessToken }: { accessToken: string }) {
  const { t } = useLanguage();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateFacilityPayload>({
    name: '',
    level: 'dispensary',
    region: '',
    mohCode: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function reload() {
    setLoading(true);
    listFacilities(accessToken)
      .then(setFacilities)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load facilities.'))
      .finally(() => setLoading(false));
  }

  useEffect(reload, [accessToken]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await createFacility(form, accessToken);
      setForm({ name: '', level: 'dispensary', region: '', mohCode: '' });
      setShowForm(false);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not create the facility.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">{t('st_facilities')}</h2>
        <button onClick={() => setShowForm((v) => !v)} className="btn-secondary w-auto px-4 py-1.5 text-xs">
          {showForm ? t('st_cancel') : t('st_add_facility')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-5 space-y-3 rounded-xl bg-slate-50 p-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              className="input"
              placeholder={t('st_facility_name')}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <select
              className="input"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value as Facility['level'] })}
            >
              {FACILITY_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l.replace('_', ' ')}
                </option>
              ))}
            </select>
            <input
              className="input"
              placeholder={t('st_region')}
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
              required
            />
            <input
              className="input"
              placeholder={t('st_moh_code')}
              value={form.mohCode}
              onChange={(e) => setForm({ ...form, mohCode: e.target.value })}
              required
            />
          </div>
          {formError && <p className="text-sm font-medium text-red-600">{formError}</p>}
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? t('st_creating') : t('st_create_facility')}
          </button>
        </form>
      )}

      {loading && <p className="text-center text-sm text-slate-400">{t('common_loading')}</p>}
      {error && <p className="text-center text-sm font-medium text-red-600">{error}</p>}

      {!loading && !error && (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="py-2">{t('st_col_name')}</th>
              <th className="py-2">{t('st_col_level')}</th>
              <th className="py-2">{t('st_region')}</th>
              <th className="py-2">{t('st_moh_code')}</th>
            </tr>
          </thead>
          <tbody>
            {facilities.map((f) => (
              <tr key={f.facilityId} className="border-b border-slate-50 last:border-0">
                <td className="py-2 font-semibold text-slate-700">{f.name}</td>
                <td className="py-2 text-slate-500">{f.level.replace('_', ' ')}</td>
                <td className="py-2 text-slate-500">{f.region}</td>
                <td className="py-2 font-mono text-xs text-slate-500">{f.mohCode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
