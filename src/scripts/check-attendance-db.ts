/**
 * Integration check for the attendance queries — run with: bun run src/scripts/check-attendance-db.ts
 *
 * It writes to the real database (data/app.db), so every row it creates is namespaced with
 * `uji-absensi-` and removed again. Never touch rows it did not create.
 */
import {
  attendanceState,
  createAttendanceLog,
  createUser,
  db,
  deleteUser,
  getAttendanceLocation,
  listAttendanceForDay,
  listAttendanceMissing,
  listAttendanceMissingRange,
  listAttendanceMonthCells,
  listAttendanceRecap,
  listAttendanceSummary,
  listOwnAttendance,
  saveAttendanceLocation,
} from "../lib/db";
import { todayIso } from "../lib/tasks";
import bcrypt from "bcryptjs";

let failures = 0;
const check = (label: string, actual: unknown, expected: unknown) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? "ok  " : "FAIL"} ${label}${ok ? "" : ` → got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`}`);
};

const TS = Date.now();
const EMAIL = `uji-absensi-${TS}@example.test`;
const EMAIL2 = `uji-absensi-${TS}-dua@example.test`;
const LABEL = `uji-absensi-${TS}`;
// A search term that matches only this script's accounts, so the report assertions do not
// depend on whatever real data the database happens to hold.
const Q = `uji-absensi-${TS}`;
const today = todayIso();
const year = today.slice(0, 4);

// The office point is a singleton, so this script must put back whatever it replaced.
const previousOffice = getAttendanceLocation();
const user = createUser("Uji Absensi", EMAIL, bcrypt.hashSync("x", 4), 2, `Staf ${TS}`);
// Second account with no logs at all: the "never shown up" case of the monthly report.
const user2 = createUser("Uji Absensi Dua", EMAIL2, bcrypt.hashSync("x", 4), 2, `Dosen ${TS}`);

// A second day in a different month of the same year, so the yearly grid has two cells.
const otherDay = today.startsWith(`${year}-01`) ? `${year}-02-15` : `${year}-01-15`;

try {
  saveAttendanceLocation({ label: LABEL, latitude: -6.2, longitude: 106.8166, radius_m: 100 });
  check("titik kantor tersimpan", getAttendanceLocation()?.label, LABEL);

  // A second save must overwrite, never add: one office only.
  saveAttendanceLocation({ label: LABEL, latitude: -6.21, longitude: 106.8166, radius_m: 150 });
  const saved = getAttendanceLocation();
  check("simpan kedua menimpa", [saved?.latitude, saved?.radius_m], [-6.21, 150]);
  check("tetap satu baris", (db.prepare("SELECT count(*) n FROM attendance_location").get() as { n: number }).n, 1);

  saveAttendanceLocation({ label: LABEL, latitude: -6.2, longitude: 106.8166, radius_m: 100 });

  const before = attendanceState(user.id, today);
  check("awal belum masuk", [before.hasCheckedIn, before.hasCheckedOut], [false, false]);

  const insert = (kind: "masuk" | "pulang") =>
    createAttendanceLog(user.id, today, {
      kind,
      location_label: LABEL,
      latitude: -6.2001,
      longitude: 106.8167,
      accuracy_m: 12,
      distance_m: 15,
      ip: "127.0.0.1",
      user_agent: "check",
    });

  check("masuk tercatat", insert("masuk"), true);
  check("masuk kedua ditolak indeks unik", insert("masuk"), false);
  check("pulang tercatat", insert("pulang"), true);

  const state = attendanceState(user.id, today);
  check("state setelah dua kejadian", [state.hasCheckedIn, state.hasCheckedOut], [true, true]);

  const own = listAttendanceForDay(user.id, today);
  check("dua baris milik sendiri", own.length, 2);
  check("nama lokasi ikut terbaca", own[0].location_label, LABEL);

  const recap = listAttendanceRecap(today).find((row) => row.user_id === user.id);
  check("rekap memuat masuk & pulang", [Boolean(recap?.masuk_at), Boolean(recap?.pulang_at)], [true, true]);

  check(
    "sudah absen tidak masuk daftar belum absen",
    listAttendanceMissing(today).some((row) => row.id === user.id),
    false,
  );

  // The label is copied into the log, so renaming the office cannot rewrite history.
  saveAttendanceLocation({ label: "Nama Baru", latitude: -6.2, longitude: 106.8166, radius_m: 100 });
  check("riwayat menyimpan nama saat kejadian", listOwnAttendance(user.id)[0].location_label, LABEL);

  // --- report queries: filter, range, summary, month grid ---

  const insertOn = (userId: number, tanggal: string, kind: "masuk" | "pulang") =>
    createAttendanceLog(userId, tanggal, {
      kind,
      location_label: LABEL,
      latitude: -6.2,
      longitude: 106.8166,
      accuracy_m: 10,
      distance_m: 5,
      ip: "127.0.0.1",
      user_agent: "check",
    });
  insertOn(user.id, otherDay, "masuk");

  check("filter nama menyempitkan rekap", listAttendanceRecap(today, Q).every((row) => row.user_id === user.id), true);
  check("filter yang tidak cocok kosong", listAttendanceRecap(today, "tidak-ada-yang-cocok-xyz").length, 0);
  // LIKE escaping: "%" must stay a literal, not match every row.
  check("persen tidak jadi wildcard", listAttendanceRecap(today, "%").length, 0);

  check(
    "filter jabatan menyempitkan daftar belum absen",
    listAttendanceMissing(today, `Dosen ${TS}`).map((row) => row.id),
    [user2.id],
  );

  const summaryRow = listAttendanceSummary(today.slice(0, 7) + "-01", `${today.slice(0, 7)}-31`, Q).find(
    (row) => row.user_id === user.id,
  );
  check("ringkasan: hari masuk & pulang", [summaryRow?.days_in, summaryRow?.days_out], [1, 1]);
  check("ringkasan: hari pertama & terakhir", [summaryRow?.first_day, summaryRow?.last_day], [today, today]);

  const absentRow = listAttendanceSummary(`${year}-01-01`, `${year}-12-31`, Q).find((row) => row.user_id === user2.id);
  check("ringkasan memuat pegawai tanpa absen", [absentRow?.days_in, absentRow?.days_out], [0, 0]);

  check(
    "rentang: yang nol sepanjang periode",
    listAttendanceMissingRange(`${year}-01-01`, `${year}-12-31`, Q).map((row) => row.id),
    [user2.id],
  );

  const cells = listAttendanceMonthCells(`${year}-01-01`, `${year}-12-31`, Q).filter((cell) => cell.user_id === user.id);
  check(
    "grid tahunan: dua bulan berisi",
    cells.map((cell) => [cell.month, cell.days_in]).sort((a, b) => a[0] - b[0]),
    [
      [Number(otherDay.slice(5, 7)), 1],
      [Number(today.slice(5, 7)), 1],
    ].sort((a, b) => a[0] - b[0]),
  );
} finally {
  // Cleanup: only this script's rows, then restore the point it replaced.
  db.prepare("DELETE FROM attendance_logs WHERE user_id IN (?, ?)").run(user.id, user2.id);
  deleteUser(user.id);
  deleteUser(user2.id);
  db.prepare("DELETE FROM attendance_location").run();
  if (previousOffice) {
    db.prepare("INSERT INTO attendance_location (id, label, latitude, longitude, radius_m) VALUES (1, ?, ?, ?, ?)").run(
      previousOffice.label,
      previousOffice.latitude,
      previousOffice.longitude,
      previousOffice.radius_m,
    );
  }
}

console.log(failures === 0 ? "\nSemua pemeriksaan lulus." : `\n${failures} pemeriksaan gagal.`);
process.exit(failures === 0 ? 0 : 1);
