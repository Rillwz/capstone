// Vocabulary and validation for "Pengajuan Lembur".
//
// The gate that opens the form lives in db.completedMinutesToday(); this module only
// validates what the form typed, so the page and the action share one parser.

import { todayIso } from "./tasks";

export const OVERTIME_NOTE_MAX = 500;

/** ISO "YYYY-MM-DD", rejecting rolled-over dates (2026-02-31) Date.parse accepts. */
const isIsoDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

const isClock = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export interface OvertimeValues {
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  keterangan: string;
}

export interface OvertimeInput extends OvertimeValues {}

/** Minutes between two "HH:MM" clocks; 0 for anything malformed. */
export function overtimeMinutes(mulai: string, selesai: string): number {
  if (!isClock(mulai) || !isClock(selesai)) return 0;
  const [h1, m1] = mulai.split(":").map(Number);
  const [h2, m2] = selesai.split(":").map(Number);
  return Math.max(0, h2 * 60 + m2 - (h1 * 60 + m1));
}

/**
 * Validate one overtime request: the message to show, or the parsed values.
 *
 * `tanggal` must be today: the gate counts today's completed minutes, so a request for
 * another day would have no basis.
 * shortcut: no overnight shifts (jam_selesai must be later than jam_mulai). Widen the gate
 * to "today + yesterday" too if a night shift is ever really worked.
 */
export function parseOvertimeValues(
  values: OvertimeValues,
): { error: string } | { value: OvertimeInput } {
  const tanggal = values.tanggal.trim();
  const jam_mulai = values.jam_mulai.trim();
  const jam_selesai = values.jam_selesai.trim();
  const keterangan = values.keterangan.trim();

  if (!isIsoDate(tanggal)) return { error: "Tanggal lembur tidak valid." };
  if (tanggal !== todayIso()) return { error: "Lembur hanya bisa diajukan untuk hari ini." };
  if (!isClock(jam_mulai)) return { error: "Jam mulai tidak valid." };
  if (!isClock(jam_selesai)) return { error: "Jam selesai tidak valid." };
  if (overtimeMinutes(jam_mulai, jam_selesai) <= 0) {
    return { error: "Jam selesai harus setelah jam mulai." };
  }
  if (keterangan.length > OVERTIME_NOTE_MAX) {
    return { error: `Keterangan maksimal ${OVERTIME_NOTE_MAX} karakter.` };
  }

  return { value: { tanggal, jam_mulai, jam_selesai, keterangan } };
}

/** The same validation, straight from a submitted form. */
export function parseOvertime(form: FormData): { error: string } | { value: OvertimeInput } {
  return parseOvertimeValues({
    tanggal: String(form.get("tanggal") ?? ""),
    jam_mulai: String(form.get("jam_mulai") ?? ""),
    jam_selesai: String(form.get("jam_selesai") ?? ""),
    keterangan: String(form.get("keterangan") ?? ""),
  });
}
