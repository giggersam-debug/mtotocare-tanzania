'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import {
  getVaccinationHistory,
  lookupChildByQr,
  recordVaccination,
  VACCINE_CODES,
  type ChildSummary,
  type VaccinationRecord,
} from '@/lib/api';

const today = () => new Date().toISOString().slice(0, 10);

export function VaccinationPanel({ accessToken }: { accessToken: string }) {
  const [qrToken, setQrToken] = useState('');
  const [child, setChild] = useState<ChildSummary | null>(null);
  const [history, setHistory] = useState<VaccinationRecord[]>([]);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);

  const [vaccineCode, setVaccineCode] = useState<(typeof VACCINE_CODES)[number]>('BCG');
  const [doseNumber, setDoseNumber] = useState('');
  const [administeredAt, setAdministeredAt] = useState(today());
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [recordError, setRecordError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [justRecorded, setJustRecorded] = useState(false);

  async function handleLookup(e: FormEvent) {
    e.preventDefault();
    if (!qrToken.trim()) return;
    setLooking(true);
    setLookupError(null);
    setChild(null);
    setJustRecorded(false);
    try {
      const summary = await lookupChildByQr(qrToken.trim(), accessToken);
      setChild(summary);
      const records = await getVaccinationHistory(summary.childId, accessToken);
      setHistory(records);
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'Lookup failed.');
    } finally {
      setLooking(false);
    }
  }

  async function handleRecord(e: FormEvent) {
    e.preventDefault();
    if (!child) return;
    setRecording(true);
    setRecordError(null);
    try {
      await recordVaccination(
        {
          childId: child.childId,
          vaccineCode,
          doseNumber: doseNumber ? Number(doseNumber) : undefined,
          administeredAt,
          batchNumber: batchNumber || undefined,
          notes: notes || undefined,
        },
        accessToken,
      );
      const records = await getVaccinationHistory(child.childId, accessToken);
      setHistory(records);
      setDoseNumber('');
      setBatchNumber('');
      setNotes('');
      setJustRecorded(true);
    } catch (err) {
      setRecordError(err instanceof Error ? err.message : 'Could not record the vaccination.');
    } finally {
      setRecording(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <form
        onSubmit={handleLookup}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-bold text-slate-900">Scan child passport</h2>
        <Field label="QR token">
          <input
            className="input font-mono text-xs"
            placeholder="Paste or scan the token from the child's QR passport"
            value={qrToken}
            onChange={(e) => setQrToken(e.target.value)}
          />
        </Field>
        {lookupError && <p className="text-sm font-medium text-red-600">{lookupError}</p>}
        <button type="submit" disabled={looking || !qrToken.trim()} className="btn-primary">
          {looking ? 'Looking up…' : 'Find child'}
        </button>
      </form>

      {child && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Child</p>
          <p className="text-lg font-bold text-slate-900">{child.fullName}</p>
          <p className="text-sm text-slate-500">
            DOB {child.dateOfBirth} · {child.sex === 'female' ? 'Female' : 'Male'}
          </p>

          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Vaccination history
            </p>
            {history.length === 0 ? (
              <p className="text-sm text-slate-400">No vaccinations recorded yet.</p>
            ) : (
              <ul className="space-y-1">
                {history.map((v) => (
                  <li
                    key={v.vaccinationId}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span className="font-semibold text-slate-700">
                      {v.vaccineCode}
                      {v.doseNumber ? ` · dose ${v.doseNumber}` : ''}
                    </span>
                    <span className="text-slate-500">{v.administeredAt}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form onSubmit={handleRecord} className="mt-6 space-y-4 border-t border-slate-100 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Record a new vaccination
            </p>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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

            {recordError && <p className="text-sm font-medium text-red-600">{recordError}</p>}
            {justRecorded && <p className="text-sm font-medium text-green">Vaccination recorded.</p>}

            <button type="submit" disabled={recording} className="btn-primary">
              {recording ? 'Recording…' : 'Record vaccination'}
            </button>
          </form>
        </div>
      )}
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
