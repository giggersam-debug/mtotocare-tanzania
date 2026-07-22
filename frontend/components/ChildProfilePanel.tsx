'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  getChildProfile,
  getChildSchedule,
  getGrowthHistory,
  getVaccinationHistory,
  recordGrowth,
  recordVaccination,
  updateGrowth,
  updateVaccination,
  VACCINE_CODES,
  type ChildProfile,
  type GrowthRecord,
  type ScheduleEntry,
  type VaccinationRecord,
} from '@/lib/api';

const today = () => new Date().toISOString().slice(0, 10);

const NUTRITIONAL_STATUS_LABEL: Record<string, string> = {
  normal: 'Normal',
  moderate_acute_malnutrition: 'Moderate acute malnutrition',
  severe_acute_malnutrition: 'Severe acute malnutrition',
};

const STATUS_STYLE: Record<ScheduleEntry['status'], string> = {
  completed: 'bg-green/10 text-green',
  due: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-600',
  not_yet_due: 'bg-slate-100 text-slate-500',
};

const STATUS_LABEL: Record<ScheduleEntry['status'], string> = {
  completed: 'Completed',
  due: 'Due',
  overdue: 'Overdue',
  not_yet_due: 'Not yet due',
};

export function ChildProfilePanel({ childId, accessToken }: { childId: string; accessToken: string }) {
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [growth, setGrowth] = useState<GrowthRecord[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function reload() {
    return Promise.all([
      getVaccinationHistory(childId, accessToken),
      getGrowthHistory(childId, accessToken),
      getChildSchedule(childId, accessToken),
    ]).then(([v, g, s]) => {
      setVaccinations(v);
      setGrowth(g);
      setSchedule(s);
    });
  }

  useEffect(() => {
    Promise.all([getChildProfile(childId, accessToken), reload()])
      .then(([p]) => setProfile(p))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load this child.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, accessToken]);

  if (loading) return <p className="text-center text-sm text-slate-400">Loading…</p>;
  if (error) return <p className="mx-auto max-w-lg text-center text-sm font-medium text-red-600">{error}</p>;
  if (!profile) return null;

  const latestGrowth = growth[growth.length - 1];
  const chartData = growth
    .filter((g) => g.weightKg !== undefined)
    .map((g) => ({ date: g.visitDate, weight: g.weightKg }));

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-400">
              ID {profile.childId.slice(0, 8).toUpperCase()}
            </p>
            <h2 className="text-xl font-bold text-slate-900">{profile.fullName}</h2>
            <p className="text-sm text-slate-500">
              {profile.sex === 'female' ? 'Female' : 'Male'} · Born {profile.dateOfBirth}
              {profile.region ? ` · ${profile.region}${profile.district ? `, ${profile.district}` : ''}` : ''}
            </p>
            {profile.guardian && (
              <p className="mt-1 text-xs text-slate-400">
                Guardian: {profile.guardian.fullName} ({profile.guardian.relation}) · {profile.guardian.phone}
              </p>
            )}
          </div>
          {latestGrowth?.nutritionalStatus && (
            <span
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                latestGrowth.nutritionalStatus === 'normal' ? 'bg-green/10 text-green' : 'bg-red-50 text-red-600'
              }`}
            >
              Nutrition: {NUTRITIONAL_STATUS_LABEL[latestGrowth.nutritionalStatus]}
            </span>
          )}
        </div>

        {latestGrowth && (
          <div className="mt-5 grid grid-cols-3 gap-4">
            <MeasureCard label="Weight" value={latestGrowth.weightKg ? `${latestGrowth.weightKg} kg` : '—'} />
            <MeasureCard label="Height" value={latestGrowth.heightCm ? `${latestGrowth.heightCm} cm` : '—'} />
            <MeasureCard label="MUAC" value={latestGrowth.muacCm ? `${latestGrowth.muacCm} cm` : '—'} />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-slate-900">Growth chart — weight over time</h3>
        {chartData.length === 0 ? (
          <p className="text-sm text-slate-400">No weight measurements recorded yet.</p>
        ) : chartData.length === 1 ? (
          <p className="text-sm text-slate-400">
            One measurement so far ({chartData[0].weight} kg on {chartData[0].date}) — record another visit to see a
            trend line.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="kg" width={40} domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#2E7D32" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-slate-900">Vaccination tracker</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="py-2">Vaccine</th>
              <th className="py-2">Scheduled</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((s) => (
              <tr key={s.code} className="border-b border-slate-50 last:border-0">
                <td className="py-2 font-medium text-slate-700">{s.label}</td>
                <td className="py-2 text-slate-500">{s.dueDate}</td>
                <td className="py-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[s.status]}`}>
                    {STATUS_LABEL[s.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <VaccinationSection
        childId={childId}
        accessToken={accessToken}
        vaccinations={vaccinations}
        onChanged={reload}
      />

      <GrowthSection childId={childId} accessToken={accessToken} growth={growth} onChanged={reload} />
    </div>
  );
}

function VaccinationSection({
  childId,
  accessToken,
  vaccinations,
  onChanged,
}: {
  childId: string;
  accessToken: string;
  vaccinations: VaccinationRecord[];
  onChanged: () => Promise<void>;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Vaccination history</h3>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          {showAdd ? 'Cancel' : '+ Record vaccination'}
        </button>
      </div>

      {showAdd && (
        <AddVaccinationForm
          childId={childId}
          accessToken={accessToken}
          onDone={async () => {
            setShowAdd(false);
            await onChanged();
          }}
        />
      )}

      {vaccinations.length === 0 ? (
        <p className="text-sm text-slate-400">No vaccinations recorded yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {vaccinations.map((v) =>
            editingId === v.vaccinationId ? (
              <EditVaccinationForm
                key={v.vaccinationId}
                record={v}
                accessToken={accessToken}
                onDone={async () => {
                  setEditingId(null);
                  await onChanged();
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <li
                key={v.vaccinationId}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="font-semibold text-slate-700">
                  {v.vaccineCode}
                  {v.doseNumber ? ` · dose ${v.doseNumber}` : ''}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-right text-xs text-slate-500">
                    {v.administeredAt}
                    {v.administeredByName && <span className="block text-slate-400">by {v.administeredByName}</span>}
                  </span>
                  <button
                    onClick={() => setEditingId(v.vaccinationId)}
                    className="text-xs font-semibold text-blue underline underline-offset-2"
                  >
                    Edit
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}

function AddVaccinationForm({
  childId,
  accessToken,
  onDone,
}: {
  childId: string;
  accessToken: string;
  onDone: () => Promise<void>;
}) {
  const [vaccineCode, setVaccineCode] = useState<(typeof VACCINE_CODES)[number]>('BCG');
  const [doseNumber, setDoseNumber] = useState('');
  const [administeredAt, setAdministeredAt] = useState(today());
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await recordVaccination(
        {
          childId,
          vaccineCode,
          doseNumber: doseNumber ? Number(doseNumber) : undefined,
          administeredAt,
          batchNumber: batchNumber || undefined,
          notes: notes || undefined,
        },
        accessToken,
      );
      await onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not record the vaccination.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-3 rounded-xl bg-slate-50 p-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Vaccine">
          <select
            className="input"
            value={vaccineCode}
            onChange={(e) => setVaccineCode(e.target.value as (typeof VACCINE_CODES)[number])}
          >
            {VACCINE_CODES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Dose number">
          <input
            className="input"
            type="number"
            min={1}
            max={5}
            value={doseNumber}
            onChange={(e) => setDoseNumber(e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date administered">
          <input
            className="input"
            type="date"
            value={administeredAt}
            onChange={(e) => setAdministeredAt(e.target.value)}
          />
        </Field>
        <Field label="Batch number">
          <input className="input" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} />
        </Field>
      </div>
      <Field label="Notes">
        <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? 'Saving…' : 'Save vaccination'}
      </button>
    </form>
  );
}

function EditVaccinationForm({
  record,
  accessToken,
  onDone,
  onCancel,
}: {
  record: VaccinationRecord;
  accessToken: string;
  onDone: () => Promise<void>;
  onCancel: () => void;
}) {
  const [vaccineCode, setVaccineCode] = useState<(typeof VACCINE_CODES)[number]>(
    record.vaccineCode as (typeof VACCINE_CODES)[number],
  );
  const [doseNumber, setDoseNumber] = useState(record.doseNumber?.toString() ?? '');
  const [administeredAt, setAdministeredAt] = useState(record.administeredAt);
  const [batchNumber, setBatchNumber] = useState(record.batchNumber ?? '');
  const [notes, setNotes] = useState(record.notes ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await updateVaccination(
        record.vaccinationId,
        {
          vaccineCode,
          doseNumber: doseNumber ? Number(doseNumber) : undefined,
          administeredAt,
          batchNumber: batchNumber || undefined,
          notes: notes || undefined,
        },
        accessToken,
      );
      await onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the vaccination.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <li className="space-y-3 rounded-xl border border-blue/30 bg-blue/5 p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Vaccine">
            <select
              className="input"
              value={vaccineCode}
              onChange={(e) => setVaccineCode(e.target.value as (typeof VACCINE_CODES)[number])}
            >
              {VACCINE_CODES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Dose number">
            <input
              className="input"
              type="number"
              min={1}
              max={5}
              value={doseNumber}
              onChange={(e) => setDoseNumber(e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date administered">
            <input
              className="input"
              type="date"
              value={administeredAt}
              onChange={(e) => setAdministeredAt(e.target.value)}
            />
          </Field>
          <Field label="Batch number">
            <input className="input" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} />
          </Field>
        </div>
        <Field label="Notes">
          <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </li>
  );
}

function GrowthSection({
  childId,
  accessToken,
  growth,
  onChanged,
}: {
  childId: string;
  accessToken: string;
  growth: GrowthRecord[];
  onChanged: () => Promise<void>;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Growth history</h3>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          {showAdd ? 'Cancel' : '+ Record growth measurement'}
        </button>
      </div>

      {showAdd && (
        <AddGrowthForm
          childId={childId}
          accessToken={accessToken}
          onDone={async () => {
            setShowAdd(false);
            await onChanged();
          }}
        />
      )}

      {growth.length === 0 ? (
        <p className="text-sm text-slate-400">No measurements recorded yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {growth.map((g) =>
            editingId === g.growthRecordId ? (
              <EditGrowthForm
                key={g.growthRecordId}
                record={g}
                accessToken={accessToken}
                onDone={async () => {
                  setEditingId(null);
                  await onChanged();
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <li
                key={g.growthRecordId}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="font-semibold text-slate-700">
                  {[
                    g.weightKg ? `${g.weightKg} kg` : null,
                    g.heightCm ? `${g.heightCm} cm` : null,
                    g.muacCm ? `MUAC ${g.muacCm} cm` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-right text-xs text-slate-500">
                    {g.visitDate}
                    {g.recordedByName && <span className="block text-slate-400">by {g.recordedByName}</span>}
                  </span>
                  <button
                    onClick={() => setEditingId(g.growthRecordId)}
                    className="text-xs font-semibold text-blue underline underline-offset-2"
                  >
                    Edit
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}

function AddGrowthForm({
  childId,
  accessToken,
  onDone,
}: {
  childId: string;
  accessToken: string;
  onDone: () => Promise<void>;
}) {
  const [visitDate, setVisitDate] = useState(today());
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [muacCm, setMuacCm] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await recordGrowth(
        {
          childId,
          visitDate,
          weightKg: weightKg ? Number(weightKg) : undefined,
          heightCm: heightCm ? Number(heightCm) : undefined,
          muacCm: muacCm ? Number(muacCm) : undefined,
          notes: notes || undefined,
        },
        accessToken,
      );
      await onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not record the measurement.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-3 rounded-xl bg-slate-50 p-4">
      <Field label="Visit date">
        <input className="input" type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Weight (kg)">
          <input className="input" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
        </Field>
        <Field label="Height (cm)">
          <input className="input" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
        </Field>
        <Field label="MUAC (cm)">
          <input className="input" value={muacCm} onChange={(e) => setMuacCm(e.target.value)} />
        </Field>
      </div>
      <Field label="Notes">
        <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? 'Saving…' : 'Save measurement'}
      </button>
    </form>
  );
}

function EditGrowthForm({
  record,
  accessToken,
  onDone,
  onCancel,
}: {
  record: GrowthRecord;
  accessToken: string;
  onDone: () => Promise<void>;
  onCancel: () => void;
}) {
  const [visitDate, setVisitDate] = useState(record.visitDate);
  const [weightKg, setWeightKg] = useState(record.weightKg?.toString() ?? '');
  const [heightCm, setHeightCm] = useState(record.heightCm?.toString() ?? '');
  const [muacCm, setMuacCm] = useState(record.muacCm?.toString() ?? '');
  const [notes, setNotes] = useState(record.notes ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await updateGrowth(
        record.growthRecordId,
        {
          visitDate,
          weightKg: weightKg ? Number(weightKg) : undefined,
          heightCm: heightCm ? Number(heightCm) : undefined,
          muacCm: muacCm ? Number(muacCm) : undefined,
          notes: notes || undefined,
        },
        accessToken,
      );
      await onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the measurement.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <li className="space-y-3 rounded-xl border border-blue/30 bg-blue/5 p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="Visit date">
          <input className="input" type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Weight (kg)">
            <input className="input" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
          </Field>
          <Field label="Height (cm)">
            <input className="input" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
          </Field>
          <Field label="MUAC (cm)">
            <input className="input" value={muacCm} onChange={(e) => setMuacCm(e.target.value)} />
          </Field>
        </div>
        <Field label="Notes">
          <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </li>
  );
}

function MeasureCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}
