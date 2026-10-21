// Vocabulary and validation for the "Jenis Aktivitas Unit Kerja" rows.

export const CLASSIFICATIONS = [
  { value: "utama", label: "Utama" },
  { value: "periodik", label: "Periodik" },
  { value: "bukan_tupoksi", label: "Bukan Tupoksi" },
] as const;

// Periode siklus tugas. "Triwulan", "Tahunan" dan "Kegiatan" mengikuti kosakata MPP
// (Matriks Rencana Kerja): triwulan & tahunan punya kalender sendiri, "Kegiatan" adalah
// tugas Sewaktu — labelnya tetap, tapi SLOT-nya bulanan (lihat lib/tasks.ts).
export const PERIODES = [
  "Harian",
  "Mingguan",
  "Bulanan",
  "Triwulan",
  "Semesteran",
  "Tahunan",
  "Kegiatan",
] as const;

export type Classification = (typeof CLASSIFICATIONS)[number]["value"];
export type Periode = (typeof PERIODES)[number];

export interface ActivityInput {
  name: string;
  /** ISO "YYYY-MM-DD", or "" when the row has no date (day input 0). */
  date: string;
  utama: boolean;
  periodik: boolean;
  bukan_tupoksi: boolean;
  periode: Periode;
  frequency: number;
  minutes: number;
  sdm: number;
  /** Derived on the server: frequency × minutes × sdm. Never taken from the form. */
  volume: number;
}

const isIntegerIn = (value: number, min: number, max: number) =>
  Number.isInteger(value) && value >= min && value <= max;

/** Rejects rolled-over dates (2026-02-31), which Date.parse silently accepts. */
const isIsoDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

/** Today in the app's timezone — the month & year a day-only input belongs to. */
export const todayInJakarta = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());

const inList = <T extends string>(options: readonly T[], value: string): value is T =>
  (options as readonly string[]).includes(value);

/** The values one activity row is made of, as typed by the user. */
export interface ActivityValues {
  name: string;
  /** The day of the month (0 = the row carries no date). */
  day: number;
  utama: boolean;
  periodik: boolean;
  bukan_tupoksi: boolean;
  periode: string;
  frequency: number;
  minutes: number;
  sdm: number;
}

/** Validate one activity row: the message to show, or the parsed values.
 *  `month` is which YYYY-MM the day belongs to; editing an old row passes its own. */
export function parseActivityValues(
  values: ActivityValues,
  month = todayInJakarta().slice(0, 7),
): { error: string } | { value: ActivityInput } {
  const { name, day, utama, periodik, bukan_tupoksi, periode, frequency, minutes, sdm } = values;

  // One checkbox per classification, so the flags are independent.
  const flags: Record<Classification, boolean> = {
    utama,
    periodik,
    bukan_tupoksi,
  };

  if (name.trim().length < 3) return { error: "Jenis aktivitas minimal 3 karakter." };
  if (name.trim().length > 500) return { error: "Jenis aktivitas maksimal 500 karakter." };
  if (!isIntegerIn(day, 0, 31)) return { error: "Tanggal harus angka hari 0–31." };

  // Only the day is typed; 0 (or empty) = no date.
  const date = day === 0 ? "" : `${month}-${String(day).padStart(2, "0")}`;
  if (date && !isIsoDate(date)) return { error: `Tanggal ${day} tidak ada di bulan ini.` };

  // The three classifications are independent — a row may carry none of them.
  if (!inList(PERIODES, periode)) return { error: "Periode tidak valid." };
  if (!isIntegerIn(frequency, 1, 9999)) return { error: "Frekuensi per tahun harus 1–9999." };
  if (!isIntegerIn(minutes, 1, 9999)) return { error: "Durasi harus 1–9999 menit." };
  if (!isIntegerIn(sdm, 1, 999)) return { error: "Jumlah SDM harus 1–999 orang." };

  // Volume kerja is not typed in: it is the yearly workload of the activity.
  const volume = frequency * minutes * sdm;

  return { value: { name: name.trim(), date, ...flags, periode, frequency, minutes, sdm, volume } };
}

/** The same validation, straight from a submitted form. */
export function parseActivity(
  form: FormData,
  month = todayInJakarta().slice(0, 7),
): { error: string } | { value: ActivityInput } {
  return parseActivityValues(
    {
      name: String(form.get("name") ?? ""),
      day: Number(form.get("day") || 0),
      utama: form.has("utama"),
      periodik: form.has("periodik"),
      bukan_tupoksi: form.has("bukan_tupoksi"),
      periode: String(form.get("periode") ?? ""),
      frequency: Number(form.get("frequency")),
      minutes: Number(form.get("minutes")),
      sdm: Number(form.get("sdm")),
    },
    month,
  );
}
