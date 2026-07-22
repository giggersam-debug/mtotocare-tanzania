// Tanzania EPI schedule (subset, infant/under-2), shared by the dashboard's
// overdue screen and the Child Profile vaccination tracker.
export const EPI_SCHEDULE: { code: string; label: string; dueAtDays: number }[] = [
  { code: 'BCG', label: 'BCG', dueAtDays: 0 },
  { code: 'OPV0', label: 'OPV 0', dueAtDays: 0 },
  { code: 'PENTA1', label: 'Pentavalent 1', dueAtDays: 42 },
  { code: 'OPV1', label: 'OPV 1', dueAtDays: 42 },
  { code: 'PCV1', label: 'PCV 1', dueAtDays: 42 },
  { code: 'ROTA1', label: 'Rotavirus 1', dueAtDays: 42 },
  { code: 'PENTA2', label: 'Pentavalent 2', dueAtDays: 70 },
  { code: 'OPV2', label: 'OPV 2', dueAtDays: 70 },
  { code: 'PCV2', label: 'PCV 2', dueAtDays: 70 },
  { code: 'ROTA2', label: 'Rotavirus 2', dueAtDays: 70 },
  { code: 'PENTA3', label: 'Pentavalent 3', dueAtDays: 98 },
  { code: 'OPV3', label: 'OPV 3', dueAtDays: 98 },
  { code: 'PCV3', label: 'PCV 3', dueAtDays: 98 },
  { code: 'IPV', label: 'IPV', dueAtDays: 98 },
  { code: 'VITAMIN_A', label: 'Vitamin A Supplement', dueAtDays: 182 },
  { code: 'YELLOW_FEVER', label: 'Yellow Fever', dueAtDays: 270 },
  { code: 'MEASLES_RUBELLA1', label: 'Measles-Rubella 1', dueAtDays: 270 },
  { code: 'MEASLES_RUBELLA2', label: 'Measles-Rubella 2', dueAtDays: 540 },
];

export const DAY_MS = 24 * 60 * 60 * 1000;

export type ScheduleStatus = 'completed' | 'due' | 'overdue' | 'not_yet_due';

export function computeSchedule(
  dateOfBirth: string,
  givenCodes: Set<string>,
  todayMs: number = Date.now(),
  dueSoonWindowDays = 14,
): { code: string; label: string; dueDate: string; status: ScheduleStatus }[] {
  const dobMs = new Date(dateOfBirth).getTime();
  const ageDays = Math.floor((todayMs - dobMs) / DAY_MS);

  return EPI_SCHEDULE.map((item) => {
    const dueDate = new Date(dobMs + item.dueAtDays * DAY_MS).toISOString().slice(0, 10);
    const given = givenCodes.has(item.code);

    let status: ScheduleStatus;
    if (given) status = 'completed';
    else if (ageDays < item.dueAtDays - dueSoonWindowDays) status = 'not_yet_due';
    else if (ageDays < item.dueAtDays) status = 'due';
    else status = 'overdue';

    return { code: item.code, label: item.label, dueDate, status };
  });
}
