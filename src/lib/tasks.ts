// The occurrence engine for the user workspace.
//
// A penugasan links a user to an activity, but an activity repeats: one penugasan becomes
// many kemunculan (occurrences), one per periode. Every date here is a Jakarta civil
// date ("YYYY-MM-DD"); the period key is the stable identity of an occurrence:
//
//   Harian      "2026-10-20"
//   Mingguan    "2026-W43"   (ISO week, Monday first)
//   Bulanan     "2026-10"
//   Triwulan    "2026-Q4"    (Oct–Dec)
//   Semesteran  "2026-S1" / "2026-S2"   (Jan–Jun / Jul–Dec)
//   Tahunan     "2026"
//   Kegiatan    "2026-10"    (tugas sewaktu — slotnya bulanan, labelnya sendiri)
//
// Calendar arithmetic runs on plain dates in UTC: no daylight saving anywhere near
// Jakarta, so a civil date never shifts.
import type { Periode } from "./activities";

const JAKARTA = "Asia/Jakarta";

/** Today in Jakarta as "YYYY-MM-DD". */
export function todayIso(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: JAKARTA }).format(now);
}

/** A SQLite datetime ("YYYY-MM-DD HH:MM:SS", in UTC) as a Jakarta civil date. */
export function dbDateToIso(value: string): string {
  return todayIso(new Date(`${value.replace(" ", "T")}Z`));
}

// --- civil date helpers ---

const parse = (date: string) => new Date(`${date}T00:00:00Z`);
const format = (d: Date) => d.toISOString().slice(0, 10);
export const addDays = (date: string, days: number) =>
  format(new Date(parse(date).getTime() + days * 86400000));
export const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();

/** Monday of the week `date` falls in. */
const weekStart = (date: string) => addDays(date, -((parse(date).getUTCDay() + 6) % 7));

/** ISO week key of the week starting on `monday`: "2026-W43". */
function isoWeekKey(monday: string): string {
  const thursday = addDays(monday, 3); // the Thursday decides the ISO year
  const year = Number(thursday.slice(0, 4));
  const firstMonday = weekStart(`${year}-01-04`);
  const week = Math.round((parse(thursday).getTime() - parse(firstMonday).getTime()) / (7 * 86400000)) + 1;
  return `${year}-W${String(week).padStart(2, "0")}`;
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  return Math.round((parse(to).getTime() - parse(from).getTime()) / 86400000);
}

export interface Period {
  key: string;
  /** First day of the period. */
  start: string;
  /** Last day of the period. */
  end: string;
}

/** The period key that `today` falls in. */
export function currentPeriodKey(periode: Periode, today: string): string {
  switch (periode) {
    case "Harian":
      return today;
    case "Mingguan":
      return isoWeekKey(weekStart(today));
    case "Bulanan":
    // "Kegiatan" is an event, not a calendar slot — it repeats every month.
    case "Kegiatan":
      return today.slice(0, 7);
    case "Triwulan":
      return `${today.slice(0, 4)}-Q${Math.ceil(Number(today.slice(5, 7)) / 3)}`;
    case "Semesteran":
      return `${today.slice(0, 4)}-S${Number(today.slice(5, 7)) <= 6 ? 1 : 2}`;
    case "Tahunan":
      return today.slice(0, 4);
  }
}

/** The period a key stands for. */
export function periodFromKey(periode: Periode, key: string): Period {
  switch (periode) {
    case "Harian":
      return { key, start: key, end: key };
    case "Mingguan": {
      const [year, week] = key.split("-W");
      const monday = addDays(weekStart(`${year}-01-04`), (Number(week) - 1) * 7);
      return { key, start: monday, end: addDays(monday, 6) };
    }
    case "Bulanan":
    case "Kegiatan": {
      const year = Number(key.slice(0, 4));
      const month = Number(key.slice(5, 7));
      return { key, start: `${key}-01`, end: `${key}-${String(daysInMonth(year, month)).padStart(2, "0")}` };
    }
    case "Triwulan": {
      const [year, quarter] = key.split("-Q");
      const first = (Number(quarter) - 1) * 3 + 1;
      const last = first + 2;
      return {
        key,
        start: `${year}-${String(first).padStart(2, "0")}-01`,
        end: `${year}-${String(last).padStart(2, "0")}-${String(daysInMonth(Number(year), last)).padStart(2, "0")}`,
      };
    }
    case "Semesteran": {
      const [year, half] = key.split("-S");
      return half === "1"
        ? { key, start: `${year}-01-01`, end: `${year}-06-30` }
        : { key, start: `${year}-07-01`, end: `${year}-12-31` };
    }
    case "Tahunan":
      return { key, start: `${key}-01-01`, end: `${key}-12-31` };
  }
}

/** The period `today` falls in. */
export function currentPeriod(periode: Periode, today: string): Period {
  const key = currentPeriodKey(periode, today);
  return periodFromKey(periode, key);
}

/** Upper bound on how many past periods one assignment can accumulate (about a year of days). */
const MAX_PERIODS = 400;

/**
 * Every period that ended before `current` started, going back to `from` (the day the
 * penugasan was made). Those are the periods a user can have missed.
 */
export function pastPeriods(periode: Periode, from: string, current: Period): Period[] {
  const out: Period[] = [];

  if (periode === "Harian") {
    for (let day = from; day < current.start && out.length < MAX_PERIODS; day = addDays(day, 1)) {
      out.push({ key: day, start: day, end: day });
    }
    return out;
  }

  if (periode === "Mingguan") {
    for (
      let monday = weekStart(from);
      monday < current.start && out.length < MAX_PERIODS;
      monday = addDays(monday, 7)
    ) {
      out.push(periodFromKey(periode, isoWeekKey(monday)));
    }
    return out;
  }

  if (periode === "Bulanan" || periode === "Kegiatan") {
    let year = Number(from.slice(0, 4));
    let month = Number(from.slice(5, 7));
    while (out.length < MAX_PERIODS) {
      const key = `${year}-${String(month).padStart(2, "0")}`;
      if (`${key}-01` >= current.start) break;
      out.push(periodFromKey(periode, key));
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }
    return out;
  }

  if (periode === "Triwulan") {
    let year = Number(from.slice(0, 4));
    let quarter = Math.ceil(Number(from.slice(5, 7)) / 3);
    while (out.length < MAX_PERIODS) {
      const key = `${year}-Q${quarter}`;
      if (periodFromKey(periode, key).start >= current.start) break;
      out.push(periodFromKey(periode, key));
      quarter += 1;
      if (quarter > 4) {
        quarter = 1;
        year += 1;
      }
    }
    return out;
  }

  if (periode === "Tahunan") {
    let year = Number(from.slice(0, 4));
    while (out.length < MAX_PERIODS) {
      const key = String(year);
      if (periodFromKey(periode, key).start >= current.start) break;
      out.push(periodFromKey(periode, key));
      year += 1;
    }
    return out;
  }

  let year = Number(from.slice(0, 4));
  let half = Number(from.slice(5, 7)) <= 6 ? 1 : 2;
  while (out.length < MAX_PERIODS) {
    const key = `${year}-S${half}`;
    const start = half === 1 ? `${year}-01-01` : `${year}-07-01`;
    if (start >= current.start) break;
    out.push(periodFromKey(periode, key));
    half += 1;
    if (half > 2) {
      half = 1;
      year += 1;
    }
  }
  return out;
}

/**
 * The day the occurrence is due. Daily tasks are due that day, weekly ones at the end
 * of the week, semester ones at the end of the semester. A monthly activity carries its
 * own day of the month; without one the month itself is the deadline.
 */
export function dueDate(periode: Periode, period: Period, activityDate: string): string {
  if ((periode === "Bulanan" || periode === "Kegiatan") && activityDate) {
    const day = Number(activityDate.slice(8, 10));
    const last = daysInMonth(Number(period.key.slice(0, 4)), Number(period.key.slice(5, 7)));
    return `${period.key}-${String(Math.min(day, last)).padStart(2, "0")}`;
  }
  return period.end;
}
