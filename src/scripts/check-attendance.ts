/**
 * Self-check for the attendance maths — run with: bun run src/scripts/check-attendance.ts
 * The fence that decides "inside or outside the office" is geometry and validation, so it
 * is checked here instead of by walking to the building.
 */
import {
  ATTENDANCE_ACCURACY_MAX,
  buildAttendanceCsv,
  circlePolygon,
  csvCell,
  csvLine,
  distanceFromOffice,
  formatDistance,
  haversineMeters,
  judgeAttendance,
  parseCheckValues,
  parseLocationValues,
  parseReportPeriod,
  shiftReportPeriod,
} from "../lib/attendance";
import type { AttendanceLocation } from "../lib/attendance";

let failures = 0;

const check = (label: string, actual: unknown, expected: unknown) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? "ok  " : "FAIL"} ${label}${ok ? "" : ` → got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`}`);
};

const near = (label: string, actual: number, expected: number, tolerance: number) => {
  const ok = Math.abs(actual - expected) <= tolerance;
  if (!ok) failures++;
  console.log(`${ok ? "ok  " : "FAIL"} ${label}${ok ? "" : ` → got ${actual}, want ${expected} ±${tolerance}`}`);
};

const OFFICE: AttendanceLocation = { id: 1, label: "Kantor Pusat", latitude: -6.2, longitude: 106.8166, radius_m: 100 };

// --- distance ---
check("jarak titik yang sama", haversineMeters(OFFICE, OFFICE), 0);
near("1° lintang ≈ 111 km", haversineMeters({ latitude: 0, longitude: 0 }, { latitude: 1, longitude: 0 }), 111_195, 60);
check(
  "jarak simetris",
  haversineMeters(OFFICE, { latitude: -6.21, longitude: 106.82 }) ===
    haversineMeters({ latitude: -6.21, longitude: 106.82 }, OFFICE),
  true,
);
near("100 m ke utara", haversineMeters(OFFICE, { latitude: -6.2 + 100 / 111_195, longitude: 106.8166 }), 100, 1);

// --- circle polygon ---
const circle = circlePolygon(OFFICE.latitude, OFFICE.longitude, 100, 16);
check("lingkaran menutup loop", circle.geometry.coordinates[0].length, 17);
check(
  "titik pertama = terakhir",
  circle.geometry.coordinates[0][0],
  circle.geometry.coordinates[0][16],
);
const ringPoint = circle.geometry.coordinates[0][0];
near("tepi lingkaran tepat di radius", haversineMeters(OFFICE, { latitude: ringPoint[1], longitude: ringPoint[0] }), 100, 2);

// --- formatting ---
check("format meter", formatDistance(43.4), "43 m");
check("format kilometer", formatDistance(1234), "1,2 km");

// --- parsing: check-in ---
check("kind asing ditolak", "error" in parseCheckValues({ kind: "x", latitude: 0, longitude: 0, accuracy_m: 5 }), true);
check("lat di luar rentang", "error" in parseCheckValues({ kind: "masuk", latitude: 91, longitude: 0, accuracy_m: 5 }), true);
check("lng di luar rentang", "error" in parseCheckValues({ kind: "masuk", latitude: 0, longitude: -181, accuracy_m: 5 }), true);
check("akurasi negatif", "error" in parseCheckValues({ kind: "masuk", latitude: 0, longitude: 0, accuracy_m: -1 }), true);
check("payload sah", "value" in parseCheckValues({ kind: "masuk", latitude: -6.2, longitude: 106.81, accuracy_m: 12 }), true);

// --- parsing: location ---
const loc = (over: Record<string, unknown> = {}) =>
  parseLocationValues({ label: "Kantor", latitude: -6.2, longitude: 106.81, radius_m: 100, ...over });
check("radius 9 ditolak", "error" in loc({ radius_m: 9 }), true);
check("radius 301 ditolak", "error" in loc({ radius_m: 301 }), true);
check("radius 10 diterima", "value" in loc({ radius_m: 10 }), true);
check("radius 300 diterima", "value" in loc({ radius_m: 300 }), true);
check("label kosong ditolak", "error" in loc({ label: " " }), true);
check("koordinat peta salah", "error" in loc({ latitude: 118 }), true);

// --- the fence ---
const judge = (over: Partial<Parameters<typeof judgeAttendance>[0]> = {}) =>
  judgeAttendance({
    kind: "masuk",
    latitude: OFFICE.latitude,
    longitude: OFFICE.longitude,
    accuracy_m: 10,
    office: OFFICE,
    hasCheckedIn: false,
    alreadyRecorded: false,
    ...over,
  });

check("lokasi belum diatur", "error" in judge({ office: null }), true);
check("di titik kantor lolos", "ok" in judge(), true);
check(
  "di tepi radius lolos",
  "ok" in judge({ latitude: OFFICE.latitude + 99 / 111_195 }),
  true,
);
check(
  "di luar radius ditolak",
  "error" in judge({ latitude: OFFICE.latitude + 101 / 111_195 }),
  true,
);
check("akurasi lemah ditolak", "error" in judge({ accuracy_m: ATTENDANCE_ACCURACY_MAX + 1 }), true);
check("akurasi ketat di radius kecil", "error" in judge({ accuracy_m: 50, office: { ...OFFICE, radius_m: 30 } }), true);
check("pulang tanpa masuk ditolak", "error" in judge({ kind: "pulang" }), true);
check("pulang setelah masuk lolos", "ok" in judge({ kind: "pulang", hasCheckedIn: true }), true);
check("dobel masuk ditolak", "error" in judge({ alreadyRecorded: true }), true);
// One office only: the helper reports the distance to it, or null before it is set.
check("tanpa titik kantor", distanceFromOffice(null, -6.2, 106.8166), null);
near("jarak ke titik kantor", distanceFromOffice(OFFICE, -6.2 + 50 / 111_195, 106.8166)!.distance, 50, 1);

// --- report periods ---
const TODAY = "2026-11-11";
const period = (raw: Parameters<typeof parseReportPeriod>[0]) => parseReportPeriod(raw, TODAY);

check("mode default harian", period({}).mode, "harian");
check("tanggal ngawur jatuh ke hari ini", period({ tanggal: "2026-13-40" }).key, TODAY);
check("tanggal tidak ada di kalender ditolak", period({ tanggal: "2026-02-30" }).key, TODAY);
check("bulan dipakai saat mode bulanan", [period({ mode: "bulanan", bulan: "2026-02" }).start, period({ mode: "bulanan", bulan: "2026-02" }).end], [
  "2026-02-01",
  "2026-02-28",
]);
check("bulan 13 ditolak", period({ mode: "bulanan", bulan: "2026-13" }).key, "2026-11");
check("tahun ngawur ditolak", period({ mode: "tahunan", tahun: "abc" }).key, "2026");
check("tahun di luar rentang ditolak", period({ mode: "tahunan", tahun: "1999" }).key, "2026");
check("parameter mode lain diabaikan", period({ mode: "harian", bulan: "2020-01" }).key, TODAY);
check("rentang tahunan", [period({ mode: "tahunan", tahun: "2025" }).start, period({ mode: "tahunan", tahun: "2025" }).end], [
  "2025-01-01",
  "2025-12-31",
]);

const shifted = (mode: "harian" | "bulanan" | "tahunan", key: string, delta: number) =>
  shiftReportPeriod(parseReportPeriod({ mode, ...(mode === "harian" ? { tanggal: key } : mode === "bulanan" ? { bulan: key } : { tahun: key }) }, TODAY), delta).key;

check("geser hari", shifted("harian", "2026-03-01", -1), "2026-02-28");
check("geser hari kabisat", shifted("harian", "2024-03-01", -1), "2024-02-29");
check("geser bulan", shifted("bulanan", "2026-01", -1), "2025-12");
check("geser bulan maju", shifted("bulanan", "2026-12", 1), "2027-01");
check("geser tahun", shifted("tahunan", "2026", -1), "2025");

// --- CSV export ---
const DAY = period({ mode: "harian", tanggal: "2026-11-11" });

check("sel biasa apa adanya", csvCell("Yusril"), "Yusril");
check("pemisah dipisah kutip", csvCell("a;b"), '"a;b"');
check("kutip digandakan", csvCell('a"b'), '"a""b"');
check("baris baru dikutip", csvCell("a\nb"), '"a\nb"');
check("kosong tetap kosong", [csvCell(null), csvCell(undefined), csvCell("")], ["", "", ""]);
// CSV injection: Excel runs a cell that starts with these.
check("rumus dinetralkan", csvCell("=SUM(1)"), "'=SUM(1)");
check("plus dinetralkan", csvCell("+1"), "'+1");
check("minus dinetralkan", csvCell("-1"), "'-1");
check("at dinetralkan", csvCell("@x"), "'@x");
check("baris satu = pemisah", csvLine(["a", 1, null]), "a;1;");

const dailyFile = buildAttendanceCsv(
  {
    period: DAY,
    daily: [
      {
        name: "Yusril Ihsanul Alim",
        email: "y@example.test",
        jabatan: "Staf; Keuangan",
        role: 1,
        tanggal: "2026-11-11",
        masuk_at: "2026-11-11 03:07:10",
        masuk_location: "Umsura",
        masuk_distance: 65.49,
        masuk_accuracy: 133.2,
        pulang_at: "2026-11-11 03:07:32",
        pulang_location: "Umsura",
        pulang_distance: 65.49,
        pulang_accuracy: 133.2,
      },
      {
        name: "Belum Hadir",
        email: "b@example.test",
        jabatan: "",
        role: 2,
        tanggal: "2026-11-11",
        masuk_at: null,
        masuk_location: null,
        masuk_distance: null,
        masuk_accuracy: null,
        pulang_at: null,
        pulang_location: null,
        pulang_distance: null,
        pulang_accuracy: null,
      },
    ],
    summary: [],
    months: new Map(),
  },
  (iso) => (iso === "2026-11-11 03:07:10" ? "10:07" : "10:07"),
);

const dailyLines = dailyFile.replace("\uFEFF", "").trimEnd().split("\r\n");
check("BOM di awal file", dailyFile.startsWith("\uFEFF"), true);
check("harian: header + 2 baris", dailyLines.length, 3);
check("harian: 14 kolom", dailyLines[0].split(";").length, 14);
check("harian: jabatan berisi ; dikutip", dailyLines[1].includes('"Staf; Keuangan"'), true);
check("harian: jarak dibulatkan", dailyLines[1].includes(";65;"), true);
check("harian: status lengkap", dailyLines[1].endsWith(";Lengkap"), true);
check("harian: yang tidak hadir diberi status", dailyLines[2].endsWith(";Tidak hadir"), true);

const summaryRow = {
  user_id: 9,
  name: "Yusril",
  email: "y@example.test",
  jabatan: "Staf",
  role: 1,
  days_in: 3,
  days_out: 2,
  first_day: "2026-11-03",
  last_day: "2026-11-11",
};

const monthlyFile = buildAttendanceCsv(
  { period: period({ mode: "bulanan", bulan: "2026-11" }), daily: [], summary: [summaryRow], months: new Map() },
  () => "",
);
const monthlyLines = monthlyFile.replace("\uFEFF", "").trimEnd().split("\r\n");
check("bulanan: 10 kolom", monthlyLines[0].split(";").length, 10);
check("bulanan: tanpa pulang dihitung", monthlyLines[1].endsWith(";1;2026-11-03;2026-11-11"), true);

const yearlyFile = buildAttendanceCsv(
  {
    period: period({ mode: "tahunan", tahun: "2026" }),
    daily: [],
    summary: [summaryRow],
    months: new Map([[9, new Map([[11, 3]])]]),
  },
  () => "",
);
const yearlyLines = yearlyFile.replace("\uFEFF", "").trimEnd().split("\r\n");
check("tahunan: 5 + 12 bulan + total", yearlyLines[0].split(";").length, 18);
check("tahunan: sel bulan terisi di posisinya", yearlyLines[1].split(";").slice(5, 17).join(","), "0,0,0,0,0,0,0,0,0,0,3,0");
check("tahunan: total di akhir", yearlyLines[1].endsWith(";3"), true);

console.log(failures === 0 ? "\nSemua pemeriksaan lulus." : `\n${failures} pemeriksaan gagal.`);
process.exit(failures === 0 ? 0 : 1);
