// Vocabulary, geometry and validation for "Absensi" (attendance by geolocation).
//
// No database here: the page uses the same parser, the action re-runs it, and the map
// draws the same radius circle the server judges against. One definition, three uses.
//
// Trust note: coordinates always come from the browser, so they can be faked. What is
// enforced server-side is that the distance is computed *here*, from the raw pair, never
// accepted from the client, and that a fix worse than the radius is refused.

import { formatPeriod } from "./format";
import { addDays, daysInMonth } from "./tasks";

/** A place an employee may check in from. */
export interface AttendanceLocation {
  id: number;
  label: string;
  latitude: number;
  longitude: number;
  radius_m: number;
}

export const ATTENDANCE_RADIUS_MIN = 10;
export const ATTENDANCE_RADIUS_MAX = 300;

/** Hard ceiling on the fix quality, whatever the radius says. */
export const ATTENDANCE_ACCURACY_MAX = 150;

const EARTH_RADIUS_M = 6_371_008.8;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in metres. */
export function haversineMeters(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * A radius as a GeoJSON polygon, for the map. Plain trigonometry instead of a turf
 * dependency: one circle does not justify a library.
 */
export function circlePolygon(latitude: number, longitude: number, radiusM: number, steps = 64) {
  const latDelta = (radiusM / EARTH_RADIUS_M) * (180 / Math.PI);
  const lngDelta = latDelta / Math.max(0.01, Math.cos(toRad(latitude)));
  const ring: Array<[number, number]> = [];
  for (let i = 0; i <= steps; i += 1) {
    const angle = (i / steps) * 2 * Math.PI;
    ring.push([longitude + lngDelta * Math.cos(angle), latitude + latDelta * Math.sin(angle)]);
  }
  return {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "Polygon" as const, coordinates: [ring] },
  };
}

/** Metres as "43 m" / "1,2 km" — the unit an employee can judge. */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
}

/** Distance from the office point, or null when no point is configured yet. */
export function distanceFromOffice(
  office: AttendanceLocation | null,
  latitude: number,
  longitude: number,
): { location: AttendanceLocation; distance: number } | null {
  if (!office) return null;
  return { location: office, distance: haversineMeters({ latitude, longitude }, office) };
}

// --- parsing ---------------------------------------------------------------

const isLatitude = (value: number) => Number.isFinite(value) && value >= -90 && value <= 90;
const isLongitude = (value: number) => Number.isFinite(value) && value >= -180 && value <= 180;

export interface CheckValues {
  kind: "masuk" | "pulang";
  latitude: number;
  longitude: number;
  accuracy_m: number;
}

/** Client-supplied check-in payload, validated. */
export function parseCheckValues(
  values: Partial<Record<keyof CheckValues, unknown>>,
): { error: string } | { value: CheckValues } {
  const kind = values.kind === "pulang" ? "pulang" : values.kind === "masuk" ? "masuk" : null;
  const latitude = Number(values.latitude);
  const longitude = Number(values.longitude);
  const accuracy = Number(values.accuracy_m);

  if (!kind) return { error: "Jenis absen tidak dikenal." };
  if (!isLatitude(latitude) || !isLongitude(longitude)) {
    return { error: "Koordinat lokasi tidak valid. Aktifkan GPS lalu coba lagi." };
  }
  if (!Number.isFinite(accuracy) || accuracy < 0) {
    return { error: "Akurasi GPS tidak valid. Coba lagi." };
  }
  return { value: { kind, latitude, longitude, accuracy_m: accuracy } };
}

export interface LocationValues {
  label: string;
  latitude: number;
  longitude: number;
  radius_m: number;
}

export const ATTENDANCE_LABEL_MAX = 80;

/** Admin-supplied location payload, validated. */
export function parseLocationValues(
  values: Partial<Record<keyof LocationValues, unknown>>,
): { error: string } | { value: LocationValues } {
  const label = String(values.label ?? "").trim();
  const latitude = Number(values.latitude);
  const longitude = Number(values.longitude);
  const radius = Number(values.radius_m);

  if (label.length < 2) return { error: "Nama lokasi minimal 2 karakter." };
  if (label.length > ATTENDANCE_LABEL_MAX) {
    return { error: `Nama lokasi maksimal ${ATTENDANCE_LABEL_MAX} karakter.` };
  }
  if (!isLatitude(latitude) || !isLongitude(longitude)) {
    return { error: "Koordinat tidak valid. Pilih titik di peta atau pakai lokasi Anda." };
  }
  if (!Number.isInteger(radius) || radius < ATTENDANCE_RADIUS_MIN || radius > ATTENDANCE_RADIUS_MAX) {
    return {
      error: `Radius harus ${ATTENDANCE_RADIUS_MIN}–${ATTENDANCE_RADIUS_MAX} meter.`,
    };
  }
  return { value: { label, latitude, longitude, radius_m: radius } };
}

// --- report periods --------------------------------------------------------

export type AttendanceMode = "harian" | "bulanan" | "tahunan";

export interface ReportPeriod {
  mode: AttendanceMode;
  /** Inclusive civil dates, "YYYY-MM-DD". */
  start: string;
  end: string;
  /** The URL value for this mode: a date, "YYYY-MM", or "YYYY". */
  key: string;
  /** Readable Indonesian label, e.g. "11 Nov 2026". */
  label: string;
}

const isCivilDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

/** The same period, moved `delta` steps (a day, a month, or a year). */
function periodFor(mode: AttendanceMode, key: string): ReportPeriod {
  if (mode === "harian") return { mode, key, start: key, end: key, label: formatPeriod("Harian", key) };
  if (mode === "bulanan") {
    const year = Number(key.slice(0, 4));
    const month = Number(key.slice(5, 7));
    return {
      mode,
      key,
      start: `${key}-01`,
      end: `${key}-${String(daysInMonth(year, month)).padStart(2, "0")}`,
      label: formatPeriod("Bulanan", key),
    };
  }
  return { mode, key, start: `${key}-01-01`, end: `${key}-12-31`, label: formatPeriod("Tahunan", key) };
}

/**
 * Read `?mode=&tanggal=&bulan=&tahun=` into one period. Every parameter is validated
 * against the mode that is actually selected, so a stale `bulan=` in a bookmarked URL
 * cannot drag a daily report into an empty month; bad input silently falls back to
 * today rather than throwing a 500 at the admin.
 */
export function parseReportPeriod(
  raw: { mode?: string | null; tanggal?: string | null; bulan?: string | null; tahun?: string | null },
  today: string,
): ReportPeriod {
  const mode: AttendanceMode =
    raw.mode === "bulanan" || raw.mode === "tahunan" ? raw.mode : "harian";

  if (mode === "harian") {
    const date = raw.tanggal ?? "";
    return periodFor(mode, isCivilDate(date) ? date : today);
  }

  if (mode === "bulanan") {
    const month = raw.bulan ?? "";
    return periodFor(mode, /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? month : today.slice(0, 7));
  }

  const year = Number(raw.tahun);
  return periodFor(mode, Number.isInteger(year) && year >= 2000 && year <= 2100 ? String(year) : today.slice(0, 4));
}

/** Move one report period by `delta` steps, in its own unit. */
export function shiftReportPeriod(period: ReportPeriod, delta: number): ReportPeriod {
  if (period.mode === "harian") return periodFor("harian", addDays(period.key, delta));
  if (period.mode === "bulanan") {
    const total = Number(period.key.slice(0, 4)) * 12 + Number(period.key.slice(5, 7)) - 1 + delta;
    const year = Math.floor(total / 12);
    const month = String((total % 12) + 1).padStart(2, "0");
    return periodFor("bulanan", `${year}-${month}`);
  }
  return periodFor("tahunan", String(Number(period.key) + delta));
}

// --- CSV export ------------------------------------------------------------

/**
 * A cell for Excel in an Indonesian locale: `;` separated, so the file opens as columns
 * without an import step. A cell that starts with `=`, `+`, `-`, `@` or a control char is
 * prefixed with `'` — otherwise Excel evaluates it as a formula (CSV injection), and names
 * and jabatan are admin-supplied text, i.e. a trust boundary.
 */
export function csvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  const guarded = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return /[;"\n\r]/.test(guarded) ? `"${guarded.replace(/"/g, '""')}"` : guarded;
}

/** One CSV line. The BOM is not here: it belongs to the whole file, once. */
export function csvLine(cells: Array<string | number | null | undefined>): string {
  return cells.map(csvCell).join(";");
}

export const CSV_MONTH_HEADERS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export interface CsvDailyRow {
  name: string;
  email: string;
  jabatan: string;
  role: number;
  tanggal: string;
  masuk_at: string | null;
  masuk_location: string | null;
  masuk_distance: number | null;
  masuk_accuracy: number | null;
  pulang_at: string | null;
  pulang_location: string | null;
  pulang_distance: number | null;
  pulang_accuracy: number | null;
}

export interface CsvSummaryRow {
  user_id: number;
  name: string;
  email: string;
  jabatan: string;
  role: number;
  days_in: number;
  days_out: number;
  first_day: string | null;
  last_day: string | null;
}

export interface CsvData {
  /** The period the file covers; already validated by `parseReportPeriod`. */
  period: ReportPeriod;
  /** Daily mode: present rows first, absentees filled in by the caller. */
  daily: CsvDailyRow[];
  /** Monthly and yearly modes. */
  summary: CsvSummaryRow[];
  /** Yearly mode: user_id → month index (1–12) → days present. */
  months: Map<number, Map<number, number>>;
}

const meter = (value: number | null) => (value === null ? "" : String(Math.round(value)));
const clock = (value: string | null, format: (iso: string) => string) => (value ? format(value) : "");
const status = (row: CsvDailyRow) => (row.masuk_at ? (row.pulang_at ? "Lengkap" : "Belum pulang") : "Tidak hadir");

/**
 * The whole file as one string, BOM included. Pure: no DB, no clock, no request — the
 * endpoint only queried and hands the rows over.
 */
export function buildAttendanceCsv(data: CsvData, formatTime: (iso: string) => string): string {
  const { period } = data;
  const lines: string[] = [];

  if (period.mode === "harian") {
    lines.push(
      csvLine([
        "Nama",
        "Email",
        "Jabatan",
        "Level",
        "Tanggal",
        "Jam masuk",
        "Lokasi masuk",
        "Jarak masuk (m)",
        "Akurasi masuk (m)",
        "Jam pulang",
        "Lokasi pulang",
        "Jarak pulang (m)",
        "Akurasi pulang (m)",
        "Status",
      ]),
    );
    for (const row of data.daily) {
      lines.push(
        csvLine([
          row.name,
          row.email,
          row.jabatan,
          row.role,
          row.tanggal,
          clock(row.masuk_at, formatTime),
          row.masuk_location,
          meter(row.masuk_distance),
          meter(row.masuk_accuracy),
          clock(row.pulang_at, formatTime),
          row.pulang_location,
          meter(row.pulang_distance),
          meter(row.pulang_accuracy),
          status(row),
        ]),
      );
    }
  } else if (period.mode === "bulanan") {
    lines.push(
      csvLine(["Nama", "Email", "Jabatan", "Level", "Periode", "Hari hadir", "Pulang lengkap", "Tanpa pulang", "Hari pertama", "Hari terakhir"]),
    );
    for (const row of data.summary) {
      lines.push(
        csvLine([
          row.name,
          row.email,
          row.jabatan,
          row.role,
          period.key,
          row.days_in,
          row.days_out,
          row.days_in - row.days_out,
          row.first_day,
          row.last_day,
        ]),
      );
    }
  } else {
    lines.push(csvLine(["Nama", "Email", "Jabatan", "Level", "Tahun", ...CSV_MONTH_HEADERS, "Total hari hadir"]));
    for (const row of data.summary) {
      const byMonth = data.months.get(row.user_id);
      lines.push(
        csvLine([
          row.name,
          row.email,
          row.jabatan,
          row.role,
          period.key,
          ...CSV_MONTH_HEADERS.map((_, i) => byMonth?.get(i + 1) ?? 0),
          row.days_in,
        ]),
      );
    }
  }

  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

// --- the decision ----------------------------------------------------------

export interface JudgeInput extends CheckValues {
  /** The single office point, or null while unset. */
  office: AttendanceLocation | null;
  /** Whether a `masuk` row already exists for today. */
  hasCheckedIn: boolean;
  /** Whether `kind` was already recorded for today. */
  alreadyRecorded: boolean;
}

export type JudgeResult =
  | { ok: true; location: AttendanceLocation; distance: number }
  | { error: string };

/**
 * Decide one check-in. Order matters: cheapest and clearest reasons first, and the
 * distance is only trusted once the fix is good enough to produce a meaningful one.
 *
 * The radius is never widened by `accuracy`: adding them would let a faker send
 * accuracy 5000 and walk through the fence.
 */
export function judgeAttendance(input: JudgeInput): JudgeResult {
  const { kind, latitude, longitude, accuracy_m: accuracy, office, hasCheckedIn, alreadyRecorded } = input;

  if (!office) return { error: "Lokasi kantor belum diatur admin." };
  if (kind === "pulang" && !hasCheckedIn) return { error: "Absen masuk dulu sebelum absen pulang." };
  if (alreadyRecorded) {
    return { error: kind === "masuk" ? "Anda sudah absen masuk hari ini." : "Anda sudah absen pulang hari ini." };
  }

  const distance = haversineMeters({ latitude, longitude }, office);
  const accuracyLimit = Math.min(office.radius_m, ATTENDANCE_ACCURACY_MAX);
  if (accuracy > accuracyLimit) {
    return {
      error: `Sinyal GPS terlalu lemah (±${formatDistance(accuracy)}). Coba di area terbuka.`,
    };
  }

  if (distance > office.radius_m) {
    return {
      error: `Anda ±${formatDistance(distance)} dari ${office.label}; batas radius ${office.radius_m} m.`,
    };
  }

  return { ok: true, location: office, distance };
}
