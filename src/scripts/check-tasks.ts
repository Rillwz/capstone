/**
 * Self-check for the period engine — run with: bun run src/scripts/check-tasks.ts
 * The dashboard's whole notion of "due" and "missed" comes from these functions, so the
 * calendar edges are checked here instead of in the browser.
 */
import {
  activePeriod,
  currentPeriod,
  currentPeriodKey,
  daysBetween,
  dueDate,
  pastPeriods,
  periodFromKey,
  todayIso,
} from "../lib/tasks";

let failures = 0;

const check = (label: string, actual: unknown, expected: unknown) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? "ok  " : "FAIL"} ${label}${ok ? "" : ` → got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`}`);
};

// --- period keys ---
check("harian key", currentPeriodKey("Harian", "2026-10-20"), "2026-10-20");
check("mingguan key", currentPeriodKey("Mingguan", "2026-10-20"), "2026-W43");
check("bulanan key", currentPeriodKey("Bulanan", "2026-10-20"), "2026-10");
check("semesteran key S1", currentPeriodKey("Semesteran", "2026-03-01"), "2026-S1");
check("semesteran key S2", currentPeriodKey("Semesteran", "2026-10-20"), "2026-S2");
check("triwulan key Q3", currentPeriodKey("Triwulan", "2026-09-30"), "2026-Q3");
check("triwulan key Q4", currentPeriodKey("Triwulan", "2026-10-20"), "2026-Q4");
check("tahunan key", currentPeriodKey("Tahunan", "2026-10-20"), "2026");
check("kegiatan key (slot bulanan)", currentPeriodKey("Kegiatan", "2026-10-20"), "2026-10");

// A Monday is the first day of its ISO week; the week belongs to the year of its Thursday.
check("mingguan start (Monday)", currentPeriod("Mingguan", "2026-10-19").start, "2026-10-19");
check("mingguan end (Sunday)", currentPeriod("Mingguan", "2026-10-19").end, "2026-10-25");
check("mingguan cross-year", currentPeriodKey("Mingguan", "2026-01-01"), "2026-W01");
check("mingguan cross-year start", currentPeriod("Mingguan", "2026-01-01").start, "2025-12-29");

// --- month lengths ---
check("februari 2026 (28 hari)", currentPeriod("Bulanan", "2026-02-10").end, "2026-02-28");
check("februari 2024 (29 hari)", currentPeriod("Bulanan", "2024-02-10").end, "2024-02-29");
check("januari 2026 (31 hari)", currentPeriod("Bulanan", "2026-01-10").end, "2026-01-31");
check("desember 2026", currentPeriod("Bulanan", "2026-12-10").end, "2026-12-31");

// --- due dates ---
check("harian jatuh tempo", dueDate("Harian", currentPeriod("Harian", "2026-10-20"), ""), "2026-10-20");
check("mingguan jatuh tempo", dueDate("Mingguan", currentPeriod("Mingguan", "2026-10-20"), ""), "2026-10-25");
check(
  "bulanan jatuh tempo ikut tanggal aktivitas",
  dueDate("Bulanan", currentPeriod("Bulanan", "2026-11-20"), "2026-10-25"),
  "2026-11-25",
);
check(
  "bulanan tanpa tanggal → akhir bulan",
  dueDate("Bulanan", currentPeriod("Bulanan", "2026-11-20"), ""),
  "2026-11-30",
);
check(
  "bulanan tanggal 31 di bulan pendek → dijepit",
  dueDate("Bulanan", currentPeriod("Bulanan", "2026-02-10"), "2026-01-31"),
  "2026-02-28",
);
check(
  "semesteran jatuh tempo",
  dueDate("Semesteran", currentPeriod("Semesteran", "2026-10-20"), ""),
  "2026-12-31",
);
check(
  "triwulan jatuh tempo",
  dueDate("Triwulan", currentPeriod("Triwulan", "2026-10-20"), ""),
  "2026-12-31",
);
check(
  "tahunan jatuh tempo",
  dueDate("Tahunan", currentPeriod("Tahunan", "2026-10-20"), ""),
  "2026-12-31",
);
check(
  "kegiatan jatuh tempo ikut tanggal aktivitas",
  dueDate("Kegiatan", currentPeriod("Kegiatan", "2026-11-20"), "2026-10-25"),
  "2026-11-25",
);

// --- past periods (what can be missed) ---
const current = currentPeriod("Harian", "2026-10-20");
check("harian: 5 hari lalu", pastPeriods("Harian", "2026-10-15", current).map((p) => p.key), [
  "2026-10-15",
  "2026-10-16",
  "2026-10-17",
  "2026-10-18",
  "2026-10-19",
]);
check(
  "mingguan: 2 minggu lalu",
  pastPeriods("Mingguan", "2026-10-01", currentPeriod("Mingguan", "2026-10-20")).map((p) => p.key),
  ["2026-W40", "2026-W41", "2026-W42"],
);
check(
  "bulanan: 2 bulan lalu",
  pastPeriods("Bulanan", "2026-07-15", currentPeriod("Bulanan", "2026-10-20")).map((p) => p.key),
  ["2026-07", "2026-08", "2026-09"],
);
check(
  "semesteran: semester lalu",
  pastPeriods("Semesteran", "2026-03-01", currentPeriod("Semesteran", "2026-10-20")).map((p) => p.key),
  ["2026-S1"],
);
check(
  "triwulan: kuartal lalu",
  pastPeriods("Triwulan", "2026-04-01", currentPeriod("Triwulan", "2026-10-20")).map((p) => p.key),
  ["2026-Q2", "2026-Q3"],
);
check(
  "tahunan: tahun lalu",
  pastPeriods("Tahunan", "2024-06-01", currentPeriod("Tahunan", "2026-10-20")).map((p) => p.key),
  ["2024", "2025"],
);
check(
  "kegiatan: bulan lalu",
  pastPeriods("Kegiatan", "2026-07-15", currentPeriod("Kegiatan", "2026-10-20")).map((p) => p.key),
  ["2026-07", "2026-08", "2026-09"],
);

// --- round trips ---
check("periodFromKey harian", periodFromKey("Harian", "2026-10-20"), {
  key: "2026-10-20",
  start: "2026-10-20",
  end: "2026-10-20",
});
check("periodFromKey mingguan", periodFromKey("Mingguan", "2026-W43").end, "2026-10-25");
check("periodFromKey bulanan", periodFromKey("Bulanan", "2026-02").end, "2026-02-28");
check("periodFromKey semesteran", periodFromKey("Semesteran", "2026-S1"), {
  key: "2026-S1",
  start: "2026-01-01",
  end: "2026-06-30",
});
check("periodFromKey triwulan", periodFromKey("Triwulan", "2026-Q4"), {
  key: "2026-Q4",
  start: "2026-10-01",
  end: "2026-12-31",
});
check("periodFromKey tahunan", periodFromKey("Tahunan", "2026"), {
  key: "2026",
  start: "2026-01-01",
  end: "2026-12-31",
});

// --- rentang berlaku (start_date / end_date) ---
check("tenggat memotong periode lampau", pastPeriods("Bulanan", "2026-07-15", currentPeriod("Bulanan", "2026-10-20"), "2026-08-20").map((p) => p.key), [
  "2026-07",
  "2026-08",
]);
check("tenggat sebelum periode pertama", pastPeriods("Bulanan", "2026-07-15", currentPeriod("Bulanan", "2026-10-20"), "2026-06-30").map((p) => p.key), []);
check(
  "jatuh tempo dipotong tenggat",
  dueDate("Bulanan", currentPeriod("Bulanan", "2026-10-20"), "2026-10-05", "2026-10-03"),
  "2026-10-03",
);
check("jatuh tempo ikut hari mulai", dueDate("Bulanan", currentPeriod("Bulanan", "2026-10-20"), "2026-11-05"), "2026-10-05");
check(
  "aktif di dalam rentang",
  activePeriod("Bulanan", "2026-10-20", { start: "2026-10-01", end: "2026-12-31" })?.key,
  "2026-10",
);
check("belum mulai", activePeriod("Bulanan", "2026-10-20", { start: "2026-11-01", end: "" }), null);
check("sudah lewat tenggat", activePeriod("Bulanan", "2026-10-20", { start: "", end: "2026-10-19" }), null);
check("tanpa tenggat tetap berjalan", activePeriod("Bulanan", "2026-10-20", { start: "", end: "" })?.key, "2026-10");

// --- misc ---
check("selisih hari", daysBetween("2026-10-20", "2026-10-25"), 5);
check("selisih hari negatif", daysBetween("2026-10-25", "2026-10-20"), -5);
check("tanggal hari ini", /^\d{4}-\d{2}-\d{2}$/.test(todayIso()), true);

console.log(failures === 0 ? "\nSemua pemeriksaan lulus." : `\n${failures} pemeriksaan gagal.`);
process.exit(failures === 0 ? 0 : 1);
