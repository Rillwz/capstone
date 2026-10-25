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
  /** ISO "YYYY-MM-DD" mulai berlaku, atau "" bila tidak dibatasi. */
  start_date: string;
  /** ISO "YYYY-MM-DD" batas akhir; "" berarti berulang tanpa batas. */
  end_date: string;
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
  /** Rentang berlaku, ISO "YYYY-MM-DD"; "" = terbuka di ujung itu. */
  start_date: string;
  end_date: string;
  utama: boolean;
  periodik: boolean;
  bukan_tupoksi: boolean;
  periode: string;
  frequency: number;
  minutes: number;
  sdm: number;
}

/** Validate one activity row: the message to show, or the parsed values. */
export function parseActivityValues(
  values: ActivityValues,
): { error: string } | { value: ActivityInput } {
  const { name, start_date, end_date, utama, periodik, bukan_tupoksi, periode, frequency, minutes, sdm } =
    values;

  // One checkbox per classification, so the flags are independent.
  const flags: Record<Classification, boolean> = {
    utama,
    periodik,
    bukan_tupoksi,
  };

  if (name.trim().length < 3) return { error: "Jenis aktivitas minimal 3 karakter." };
  if (name.trim().length > 500) return { error: "Jenis aktivitas maksimal 500 karakter." };

  // Rentang berlaku: mulai & tenggat. Kosong berarti terbuka; tenggat boleh
  // dikosongkan (berulang tanpa batas) tapi tidak boleh mendahului tanggal mulai.
  if (start_date && !isIsoDate(start_date)) return { error: "Tanggal mulai tidak valid." };
  if (end_date && !isIsoDate(end_date)) return { error: "Tenggat tidak valid." };
  if (start_date && end_date && end_date < start_date) {
    return { error: "Tenggat tidak boleh sebelum tanggal mulai." };
  }

  // The three classifications are independent — a row may carry none of them.
  if (!inList(PERIODES, periode)) return { error: "Periode tidak valid." };
  if (!isIntegerIn(frequency, 1, 9999)) return { error: "Frekuensi per tahun harus 1–9999." };
  if (!isIntegerIn(minutes, 1, 9999)) return { error: "Durasi harus 1–9999 menit." };
  if (!isIntegerIn(sdm, 1, 999)) return { error: "Jumlah SDM harus 1–999 orang." };

  // Volume kerja is not typed in: it is the yearly workload of the activity.
  const volume = frequency * minutes * sdm;

  return {
    value: {
      name: name.trim(),
      start_date,
      end_date,
      ...flags,
      periode,
      frequency,
      minutes,
      sdm,
      volume,
    },
  };
}

/** The same validation, straight from a submitted form. */
export function parseActivity(form: FormData): { error: string } | { value: ActivityInput } {
  return parseActivityValues({
    name: String(form.get("name") ?? ""),
    start_date: String(form.get("start_date") ?? ""),
    end_date: String(form.get("end_date") ?? ""),
    utama: form.has("utama"),
    periodik: form.has("periodik"),
    bukan_tupoksi: form.has("bukan_tupoksi"),
    periode: String(form.get("periode") ?? ""),
    frequency: Number(form.get("frequency")),
    minutes: Number(form.get("minutes")),
    sdm: Number(form.get("sdm")),
  });
}
