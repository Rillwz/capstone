import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { ActivityInput, Periode } from "./activities";
import type { AttendanceLocation, LocationValues } from "./attendance";
import { activePeriod, currentPeriod, dbDateToIso, dueDate, pastPeriods, periodFromKey, todayIso } from "./tasks";

// SQLite database lives in /data at project root.
const dataDir = join(process.cwd(), "data");
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

const db = new Database(join(dataDir, "app.db"));
db.pragma("journal_mode = WAL");

/**
 * Unit sistem tempat aktivitas hasil "Instruksi" bermuara. Aktivitas yang
 * lahir dari dialog itu tetap harus punya unit; satu unit khusus membuatnya mudah
 * ditelusuri dan tidak mengotori tiap-tiap unit kerja.
 */
export const DIRECT_CATEGORY = "penugasan-langsung";

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role INTEGER NOT NULL DEFAULT 1 CHECK (role IN (0, 1, 2)),
    jabatan TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Daftar Posisi/Jabatan yang bisa dipilih di form pengguna. Kolom users.jabatan
  -- menyimpan labelnya (teks), jadi menghapus satu jabatan tidak menghapus akunnya.
  CREATE TABLE IF NOT EXISTS positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Satu jabatan = satu label, tanpa peduli huruf besar/kecil. Indeks (bukan COLLATE
  -- pada kolom) supaya database yang tabelnya sudah terlanjur dibuat ikut terkunci.
  CREATE UNIQUE INDEX IF NOT EXISTS idx_positions_label ON positions (label COLLATE NOCASE);

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    position INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS login_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_login_logs_user ON login_logs (user_id, id DESC);

  -- Permintaan "Lupa kata sandi" dari halaman login. Tidak ada token: baris ini
  -- tidak memberi akses apa pun, admin yang mengeksekusi reset di /dashboard.
  CREATE TABLE IF NOT EXISTS password_reset_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reset', 'rejected')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    handled_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    handled_at TEXT
  );

  -- Sebagian besar query hanya peduli yang masih menunggu, jadi indeks parsial.
  CREATE INDEX IF NOT EXISTS idx_reset_requests_pending ON password_reset_requests (status) WHERE status = 'pending';

  -- Pengajuan lembur. Satu baris = satu pengajuan untuk satu tanggal; durasinya
  -- dihitung dari jam_mulai/jam_selesai saat tampil, bukan disimpan.
  CREATE TABLE IF NOT EXISTS overtime_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Tanggal sipil "YYYY-MM-DD" (hari lembur), bukan datetime: bebas dari zona waktu.
    tanggal TEXT NOT NULL,
    jam_mulai TEXT NOT NULL,
    jam_selesai TEXT NOT NULL,
    keterangan TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'disetujui', 'ditolak')),
    -- Alasan penolakan / catatan persetujuan dari admin.
    catatan_admin TEXT NOT NULL DEFAULT '',
    -- NULL = hasil keputusan belum dilihat pemohon (lonceng di header).
    seen_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    handled_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    handled_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_overtime_pending ON overtime_requests (status) WHERE status = 'pending';

  -- Satu pengajuan menunggu per orang per tanggal: klik berulang tidak jadi dua baris.
  CREATE UNIQUE INDEX IF NOT EXISTS idx_overtime_one_pending
    ON overtime_requests (user_id, tanggal) WHERE status = 'pending';

  CREATE INDEX IF NOT EXISTS idx_overtime_user ON overtime_requests (user_id, tanggal DESC, id DESC);

  -- Setelan lembur: satu baris saja, supaya query tidak perlu memilih "yang terbaru".
  CREATE TABLE IF NOT EXISTS overtime_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    -- Ambang pemicu tombol pengajuan: total menit tugas selesai hari ini.
    min_minutes INTEGER NOT NULL DEFAULT 60,
    -- Batas diam sebelum pengajuan ditolak otomatis.
    expire_minutes INTEGER NOT NULL DEFAULT 180
  );
  INSERT OR IGNORE INTO overtime_settings (id) VALUES (1);

  -- Work units (kategori). Ikon disimpan sebagai kunci teks (lihat ICON_PALETTE di
  -- lib/categories.ts); urutan tampil mengikuti kolom position.
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'tags',
    position INTEGER NOT NULL DEFAULT 0
  );
`);

// Seed sekali: 11 unit awal, supaya data activities/assignments lama tetap nyambung.
const categoryCount = (db.prepare("SELECT count(*) AS n FROM categories").get() as { n: number }).n;
if (categoryCount === 0) {
  const DEFAULT_CATEGORIES: Array<[string, string, string]> = [
    ["tata-usaha", "Tata Usaha", "clipboard-list"],
    ["kesekretariatan", "Kesekretariatan", "file-text"],
    ["keuangan", "Keuangan", "wallet"],
    ["sarpras", "SARPRAS", "warehouse"],
    ["kepegawaian", "KEPEGAWAIAN", "user-cog"],
    ["humas", "HUMAS", "megaphone"],
    ["laboran", "LABORAN", "flask-conical"],
    ["it", "IT", "monitor-smartphone"],
    ["admin-prodi", "ADMIN PRODI", "graduation-cap"],
    ["kerumahtanggaan", "KERUMAHTANGGAAN", "broom"],
    ["kerjasama", "KERJASAMA", "handshake"],
  ];
  const seed = db.prepare("INSERT INTO categories (id, label, icon, position) VALUES (?, ?, ?, ?)");
  db.transaction(() => DEFAULT_CATEGORIES.forEach(([id, label, icon], i) => seed.run(id, label, icon, i)))();
}

// Activity rows of a work unit (kategori) — the "Jenis Aktivitas Unit Kerja" table.
db.exec(`
  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id TEXT NOT NULL,
    name TEXT NOT NULL,
    -- Rentang berlaku: "YYYY-MM-DD". '' = tanpa batas di ujung itu.
    start_date TEXT NOT NULL DEFAULT '',
    end_date TEXT NOT NULL DEFAULT '',
    utama INTEGER NOT NULL DEFAULT 0 CHECK (utama IN (0, 1)),
    periodik INTEGER NOT NULL DEFAULT 0 CHECK (periodik IN (0, 1)),
    bukan_tupoksi INTEGER NOT NULL DEFAULT 0 CHECK (bukan_tupoksi IN (0, 1)),
    periode TEXT NOT NULL CHECK (periode IN ('Harian', 'Mingguan', 'Bulanan', 'Triwulan', 'Semesteran', 'Tahunan', 'Kegiatan')),
    frequency INTEGER NOT NULL DEFAULT 0,
    minutes INTEGER NOT NULL,
    sdm INTEGER NOT NULL,
    volume INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_activities_category ON activities (category_id, id);

  CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL,
    activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    -- NULL = belum dibaca pemegangnya (notifikasi "pekerjaan masuk").
    seen_at TEXT,
    -- Siapa yang menugaskan. NULL = baris lama, dianggap diberikan sistem.
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    -- '' = diberikan lewat katalog, 'langsung' = lahir dari dialog Instruksi.
    origin TEXT NOT NULL DEFAULT '',
    UNIQUE (user_id, activity_id)
  );

  CREATE INDEX IF NOT EXISTS idx_assignments_user ON assignments (user_id);

  -- Sebagian besar query hanya peduli yang belum dibaca, jadi indeks parsial.
  CREATE INDEX IF NOT EXISTS idx_assignments_unseen ON assignments (user_id) WHERE seen_at IS NULL;

  -- Log aktivitas: satu baris per kemunculan (occurrence) — status "selesai" atau "terlewat".
  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    period_key TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('selesai', 'terlewat')),
    completed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (user_id, activity_id, period_key)
  );

  CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs (user_id, period_key);

  -- Catatan & tautan per kemunculan. Berdiri sendiri dari activity_logs, jadi catatan
  -- tetap ada saat tanda selesai dibatalkan, dan bisa ditulis sebelum tugas selesai.
  CREATE TABLE IF NOT EXISTS occurrence_notes (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    period_key TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    link TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, activity_id, period_key)
  );

  CREATE INDEX IF NOT EXISTS idx_occurrence_notes_user ON occurrence_notes (user_id);

  -- Absensi: satu titik kantor (geofence) dan kejadian absen per orang per hari.
  -- Titiknya singleton (CHECK id = 1) seperti overtime_settings: satu kantor, satu radius.
  CREATE TABLE IF NOT EXISTS attendance_location (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    label TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    radius_m INTEGER NOT NULL DEFAULT 100 CHECK (radius_m BETWEEN 10 AND 300),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Satu baris = satu kejadian (masuk / pulang), bukan satu hari dengan dua kolom:
  -- masing-masing membawa koordinat, akurasi, dan jaraknya sendiri. Tanggalnya hari
  -- sipil Jakarta; jamnya created_at. location_label adalah salinan nama titik saat itu,
  -- jadi mengganti nama kantor tidak menulis ulang sejarah.
  CREATE TABLE IF NOT EXISTS attendance_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tanggal TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('masuk', 'pulang')),
    location_label TEXT NOT NULL DEFAULT '',
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    accuracy_m REAL NOT NULL,
    -- Dihitung server dari lat/lng; klien tidak pernah mengirim jarak.
    distance_m REAL NOT NULL,
    ip TEXT NOT NULL DEFAULT '',
    user_agent TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (user_id, tanggal, kind)
  );

  CREATE INDEX IF NOT EXISTS idx_attendance_day ON attendance_logs (tanggal, user_id);
`);

// Migration: the office point became a singleton (`attendance_location`). The old
// multi-location table is folded in: the active row wins, `location_label` is copied into
// every log so history keeps the name it was recorded under, then the old table is dropped.
const attendanceTables = (
  db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('attendance_locations', 'attendance_location')").all() as Array<{
    name: string;
  }>
).map((row) => row.name);

if (attendanceTables.includes("attendance_locations")) {
  const legacy = db
    .prepare("SELECT label, latitude, longitude, radius_m FROM attendance_locations ORDER BY active DESC, id LIMIT 1")
    .get() as { label: string; latitude: number; longitude: number; radius_m: number } | undefined;

  const logColumns = (db.prepare("PRAGMA table_info(attendance_logs)").all() as Array<{ name: string }>).map(
    (column) => column.name,
  );

  db.pragma("foreign_keys = OFF");
  db.transaction(() => {
    if (legacy) {
      db.prepare(
        `INSERT OR REPLACE INTO attendance_location (id, label, latitude, longitude, radius_m)
         VALUES (1, ?, ?, ?, ?)`,
      ).run(legacy.label, legacy.latitude, legacy.longitude, legacy.radius_m);
    }

    if (logColumns.includes("location_id") && !logColumns.includes("location_label")) {
      db.exec(`
        ALTER TABLE attendance_logs ADD COLUMN location_label TEXT NOT NULL DEFAULT '';
        UPDATE attendance_logs
           SET location_label = COALESCE(
                 (SELECT o.label FROM attendance_locations o WHERE o.id = attendance_logs.location_id),
                 ''
               );
        ALTER TABLE attendance_logs DROP COLUMN location_id;
      `);
    }

    db.exec("DROP TABLE attendance_locations;");
  })();
  db.pragma("foreign_keys = ON");
}

// Migration: "classification" (pick one) became three independent flags.
const activityColumns = db.prepare("PRAGMA table_info(activities)").all() as Array<{ name: string }>;
if (activityColumns.some((column) => column.name === "classification")) {
  db.exec(`
    ALTER TABLE activities ADD COLUMN utama INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE activities ADD COLUMN periodik INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE activities ADD COLUMN bukan_tupoksi INTEGER NOT NULL DEFAULT 0;
    UPDATE activities SET
      utama = CASE WHEN classification = 'utama' THEN 1 ELSE 0 END,
      periodik = CASE WHEN classification = 'periodik' THEN 1 ELSE 0 END,
      bukan_tupoksi = CASE WHEN classification = 'bukan_tupoksi' THEN 1 ELSE 0 END;
    ALTER TABLE activities DROP COLUMN classification;
  `);
}

// Migration: "Frekuensi/ Tahun" column (rows that predate it keep 0 until edited).
if (!activityColumns.some((column) => column.name === "frequency")) {
  db.exec("ALTER TABLE activities ADD COLUMN frequency INTEGER NOT NULL DEFAULT 0;");
}

// Migration: `position` was added for manual drag-and-drop ordering.
const postColumns = db.prepare("PRAGMA table_info(posts)").all() as Array<{ name: string }>;
if (!postColumns.some((column) => column.name === "position")) {
  db.exec(`
    ALTER TABLE posts ADD COLUMN position INTEGER NOT NULL DEFAULT 0;
    UPDATE posts SET position = (
      SELECT count(*) FROM posts p2
      WHERE p2.created_at > posts.created_at
         OR (p2.created_at = posts.created_at AND p2.id > posts.id)
    );
  `);
}

// Migration: `jabatan` (posisi/jabatan) was added to the user profile.
const userColumns = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
if (!userColumns.some((column) => column.name === "jabatan")) {
  db.exec("ALTER TABLE users ADD COLUMN jabatan TEXT NOT NULL DEFAULT '';");
}

// Migration: `seen_at` menandai penugasan yang sudah dibaca pemegangnya (notifikasi
// "pekerjaan masuk"). NULL = belum dibaca. Penugasan yang sudah ada sebelum fitur ini
// dianggap sudah dibaca — kalau tidak, lonceng langsung berangka palsu setelah rilis.
const assignmentColumns = db.prepare("PRAGMA table_info(assignments)").all() as Array<{ name: string }>;
if (!assignmentColumns.some((column) => column.name === "seen_at")) {
  db.exec(`
    ALTER TABLE assignments ADD COLUMN seen_at TEXT;
    UPDATE assignments SET seen_at = created_at;
    CREATE INDEX IF NOT EXISTS idx_assignments_unseen ON assignments (user_id) WHERE seen_at IS NULL;
  `);
}

// Migration: `created_by` + `origin` lahir bersama Instruksi. Baris lama
// dianggap diberikan sistem (created_by NULL, origin ''), jadi tidak perlu diisi.
if (!assignmentColumns.some((column) => column.name === "created_by")) {
  db.exec("ALTER TABLE assignments ADD COLUMN created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;");
}
if (!assignmentColumns.some((column) => column.name === "origin")) {
  db.exec("ALTER TABLE assignments ADD COLUMN origin TEXT NOT NULL DEFAULT '';");
}
// Migration: `archived_at` = penugasan diarsipkan. Barisnya tetap ada (catatan dan
// riwayat utuh), hanya hilang dari dasbor dan lonceng pemegangnya. NULL = aktif.
if (!assignmentColumns.some((column) => column.name === "archived_at")) {
  db.exec("ALTER TABLE assignments ADD COLUMN archived_at TEXT;");
}

// Unit sistem tempat aktivitas hasil Instruksi bermuara. Dibuat idempoten,
// seperti seed 11 unit di atas; position di paling akhir.
if (!db.prepare("SELECT 1 FROM categories WHERE id = ?").get(DIRECT_CATEGORY)) {
  db.prepare(
    "INSERT INTO categories (id, label, icon, position) VALUES (?, ?, ?, (SELECT COALESCE(MAX(position), -1) + 1 FROM categories))",
  ).run(DIRECT_CATEGORY, "Instruksi", "zap");
}

// Unit itu sudah ada di database lama dengan label lamanya; admin boleh mengganti label
// unit lain, tapi unit sistem ini tidak muncul di layar pengelolaan — jadi namanya
// diselaraskan di sini, bukan dibiarkan berbeda dari yang tertulis di menu.
db.prepare("UPDATE categories SET label = ? WHERE id = ? AND label = ?").run(
  "Instruksi",
  DIRECT_CATEGORY,
  "Penugasan Langsung",
);

// Migration: the period vocabulary grew (Triwulan, Tahunan, Kegiatan — kosakata MPP).
// The CHECK constraint lives inside the table definition, so a stale table is rebuilt.
// Foreign keys are switched off while rebuilding, so the assignments, logs and notes
// that point at an activity survive the swap.
const activitiesSchema = db
  .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'activities'")
  .get() as { sql: string } | undefined;
if (activitiesSchema && !activitiesSchema.sql.includes("'Triwulan'")) {
  db.pragma("foreign_keys = OFF");
  db.exec(`
    CREATE TABLE activities_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      utama INTEGER NOT NULL DEFAULT 0 CHECK (utama IN (0, 1)),
      periodik INTEGER NOT NULL DEFAULT 0 CHECK (periodik IN (0, 1)),
      bukan_tupoksi INTEGER NOT NULL DEFAULT 0 CHECK (bukan_tupoksi IN (0, 1)),
      periode TEXT NOT NULL CHECK (periode IN ('Harian', 'Mingguan', 'Bulanan', 'Triwulan', 'Semesteran', 'Tahunan', 'Kegiatan')),
      frequency INTEGER NOT NULL DEFAULT 0,
      minutes INTEGER NOT NULL,
      sdm INTEGER NOT NULL,
      volume INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    INSERT INTO activities_new (id, category_id, name, date, utama, periodik, bukan_tupoksi, periode, frequency, minutes, sdm, volume, created_at)
      SELECT id, category_id, name, date, utama, periodik, bukan_tupoksi, periode, frequency, minutes, sdm, volume, created_at FROM activities;
    DROP TABLE activities;
    ALTER TABLE activities_new RENAME TO activities;
    CREATE INDEX IF NOT EXISTS idx_activities_category ON activities (category_id, id);
  `);
  db.pragma("foreign_keys = ON");
}

// Migration: satu kolom `date` (hanya harinya yang bermakna) menjadi rentang berlaku
// `start_date` + `end_date`. Nilai lama dipetakan apa adanya ke `start_date` — hari itu
// tetap jadi anchor jatuh tempo bulanan, jadi tidak ada perilaku yang berubah dan tidak
// ada tanggal yang dikarang. `end_date` dibiarkan kosong: berulang tanpa batas.
const rangeColumns = db.prepare("PRAGMA table_info(activities)").all() as Array<{ name: string }>;
if (rangeColumns.some((column) => column.name === "date")) {
  db.pragma("foreign_keys = OFF");
  db.exec(`
    CREATE TABLE activities_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      start_date TEXT NOT NULL DEFAULT '',
      end_date TEXT NOT NULL DEFAULT '',
      utama INTEGER NOT NULL DEFAULT 0 CHECK (utama IN (0, 1)),
      periodik INTEGER NOT NULL DEFAULT 0 CHECK (periodik IN (0, 1)),
      bukan_tupoksi INTEGER NOT NULL DEFAULT 0 CHECK (bukan_tupoksi IN (0, 1)),
      periode TEXT NOT NULL CHECK (periode IN ('Harian', 'Mingguan', 'Bulanan', 'Triwulan', 'Semesteran', 'Tahunan', 'Kegiatan')),
      frequency INTEGER NOT NULL DEFAULT 0,
      minutes INTEGER NOT NULL,
      sdm INTEGER NOT NULL,
      volume INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    INSERT INTO activities_new (id, category_id, name, start_date, end_date, utama, periodik, bukan_tupoksi, periode, frequency, minutes, sdm, volume, created_at)
      SELECT id, category_id, name, date, '', utama, periodik, bukan_tupoksi, periode, frequency, minutes, sdm, volume, created_at FROM activities;
    DROP TABLE activities;
    ALTER TABLE activities_new RENAME TO activities;
    CREATE INDEX IF NOT EXISTS idx_activities_category ON activities (category_id, id);
  `);
  db.pragma("foreign_keys = ON");
}

// ---------------------------------------------------------------------------
// Kategori (unit kerja): baris dinamis di tabel categories.
// ---------------------------------------------------------------------------

export interface CategoryRow {
  id: string;
  label: string;
  icon: string;
  position: number;
}

export function listCategories(): CategoryRow[] {
  return db.prepare("SELECT id, label, icon, position FROM categories ORDER BY position, label COLLATE NOCASE").all() as CategoryRow[];
}

export function getCategory(id: string): CategoryRow | undefined {
  return db.prepare("SELECT id, label, icon, position FROM categories WHERE id = ?").get(id) as CategoryRow | undefined;
}

/** Buat kategori baru; id adalah slug dari label. Mengembalikan id-nya atau null bila slug sudah dipakai. */
export function createCategory(label: string, icon: string): string | null {
  const base = label.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "kategori";
  const taken = new Set(
    (db.prepare("SELECT id FROM categories").all() as Array<{ id: string }>).map((row) => row.id),
  );
  let id = base;
  for (let i = 2; taken.has(id); i++) id = `${base}-${i}`;
  const max = (db.prepare("SELECT COALESCE(MAX(position), -1) AS p FROM categories").get() as { p: number }).p;
  try {
    db.prepare("INSERT INTO categories (id, label, icon, position) VALUES (?, ?, ?, ?)").run(id, label.trim(), icon, max + 1);
  } catch {
    return null;
  }
  return id;
}

/** Ubah nama & ikon kategori. Mengembalikan false bila id-nya tidak ada — id tidak pernah berubah, jadi data anak aman. */
export function updateCategory(id: string, label: string, icon: string): boolean {
  const info = db.prepare("UPDATE categories SET label = ?, icon = ? WHERE id = ?").run(label.trim(), icon, id);
  return info.changes > 0;
}

/** Hapus kategori beserta aktivitas, penugasan, log dan catatannya.
 *  Unit sistem (Instruksi) ditolak: `activities.category_id` tidak punya
 *  foreign key, jadi tanpanya aktivitasnya jadi yatim tanpa unit. */
export function deleteCategory(id: string): boolean {
  if (id === DIRECT_CATEGORY) return false;
  db.transaction(() => {
    db.prepare(
      `DELETE FROM occurrence_notes WHERE activity_id IN (SELECT id FROM activities WHERE category_id = ?)`,
    ).run(id);
    db.prepare("DELETE FROM assignments WHERE category_id = ?").run(id);
    db.prepare(
      `DELETE FROM activity_logs WHERE activity_id IN (SELECT id FROM activities WHERE category_id = ?)`,
    ).run(id);
    db.prepare("DELETE FROM activities WHERE category_id = ?").run(id);
    db.prepare("DELETE FROM categories WHERE id = ?").run(id);
  })();
  return true;
}

export interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 0 | 1 | 2;
  jabatan: string;
  created_at: string;
}

export function getUserByEmail(email: string): UserRow | undefined {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as UserRow | undefined;
}

export function getUserById(id: number): UserRow | undefined {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
}

/** Profile update: the password hash is only written when a new one is given. */
export function updateUserProfile(id: number, name: string, passwordHash?: string): void {
  if (passwordHash) {
    db.prepare("UPDATE users SET name = ?, password_hash = ? WHERE id = ?").run(name, passwordHash, id);
  } else {
    db.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, id);
  }
}

export function createUser(
  name: string,
  email: string,
  passwordHash: string,
  role: 0 | 1 | 2,
  jabatan = "",
): UserRow {
  db.prepare("INSERT INTO users (name, email, password_hash, role, jabatan) VALUES (?, ?, ?, ?, ?)").run(
    name,
    email.toLowerCase(),
    passwordHash,
    role,
    jabatan.trim(),
  );
  return getUserByEmail(email)!;
}

/** Admin edit of another account: name, email, jabatan and level in one write. */
export function updateUserAccount(
  id: number,
  name: string,
  email: string,
  jabatan: string,
  role: 0 | 1 | 2,
): boolean {
  const info = db
    .prepare("UPDATE users SET name = ?, email = ?, jabatan = ?, role = ? WHERE id = ?")
    .run(name, email.toLowerCase(), jabatan.trim(), role, id);
  return info.changes > 0;
}

/**
 * Catat permintaan "Lupa kata sandi". Satu akun hanya boleh punya satu permintaan
 * yang masih menunggu, supaya daftar admin tidak dibanjiri klik berulang.
 * "unknown" untuk email yang tidak terdaftar — pemanggil menampilkan pesan yang
 * sama, jadi hasil ini tidak boleh bocor ke layar.
 */
export function createPasswordResetRequest(email: string): "created" | "duplicate" | "unknown" {
  const user = getUserByEmail(email);
  if (!user) return "unknown";
  const pending = db
    .prepare("SELECT 1 FROM password_reset_requests WHERE user_id = ? AND status = 'pending'")
    .get(user.id);
  if (pending) return "duplicate";
  db.prepare("INSERT INTO password_reset_requests (user_id) VALUES (?)").run(user.id);
  return "created";
}

export function countPendingPasswordResets(): number {
  return (
    db.prepare("SELECT count(*) AS n FROM password_reset_requests WHERE status = 'pending'").get() as {
      n: number;
    }
  ).n;
}

export interface PasswordResetRow {
  id: number;
  user_id: number;
  name: string;
  email: string;
  jabatan: string;
  status: "pending" | "reset" | "rejected";
  created_at: string;
  handled_at: string | null;
  handled_by_name: string | null;
}

/** Permintaan reset, yang menunggu lebih dulu lalu yang sudah ditangani (terbaru dulu). */
export function listPasswordResets(limit = 50): PasswordResetRow[] {
  return db
    .prepare(
      `SELECT r.id, r.user_id, u.name, u.email, u.jabatan, r.status, r.created_at, r.handled_at,
              a.name AS handled_by_name
       FROM password_reset_requests r
       JOIN users u ON u.id = r.user_id
       LEFT JOIN users a ON a.id = r.handled_by
       ORDER BY r.status = 'pending' DESC, r.id DESC
       LIMIT ?`,
    )
    .all(limit) as PasswordResetRow[];
}

/**
 * Tutup satu permintaan: "reset" menimpa kata sandi akun (hash dihitung pemanggil,
 * karena bcrypt asinkron) lalu menandai selesai, "rejected" hanya menandai.
 * Hanya baris yang masih 'pending' yang bisa ditangani.
 */
export function handlePasswordReset(
  id: number,
  adminId: number,
  action: "reset" | "rejected",
  passwordHash?: string,
): boolean {
  return db.transaction(() => {
    const row = db.prepare("SELECT user_id FROM password_reset_requests WHERE id = ? AND status = 'pending'").get(id) as
      | { user_id: number }
      | undefined;
    if (!row) return false;
    if (action === "reset") {
      if (!passwordHash) return false;
      db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(passwordHash, row.user_id);
    }
    db.prepare(
      "UPDATE password_reset_requests SET status = ?, handled_by = ?, handled_at = datetime('now') WHERE id = ?",
    ).run(action, adminId, id);
    return true;
  })();
}

// ---------------------------------------------------------------------------
// Lembur: pengajuan dari pegawai, keputusan di sisi admin.
// ---------------------------------------------------------------------------

export interface OvertimeSettings {
  /** Total menit tugas selesai hari ini yang membuka tombol pengajuan. */
  min_minutes: number;
  /** Batas diam sebelum pengajuan ditolak otomatis. */
  expire_minutes: number;
}

export function getOvertimeSettings(): OvertimeSettings {
  return db
    .prepare("SELECT min_minutes, expire_minutes FROM overtime_settings WHERE id = 1")
    .get() as OvertimeSettings;
}

export function saveOvertimeSettings(minMinutes: number, expireMinutes: number): void {
  db.prepare("UPDATE overtime_settings SET min_minutes = ?, expire_minutes = ? WHERE id = 1").run(
    minMinutes,
    expireMinutes,
  );
}

/**
 * Tolak pengajuan yang tidak disentuh dalam batas waktu setelan.
 *
 * Tanpa cron: sapuan ini berjalan sebelum setiap pembacaan daftar. `handled_at` dihitung
 * dari `created_at`, bukan dari waktu sapuan, jadi keputusannya sama walau sapuan baru
 * jalan berjam-jam kemudian.
 *
 * shortcut: penolakannya baru tertulis saat ada yang membaca; batas waktunya sendiri tetap
 * deterministik. Ganti dengan penjadwal kalau penulisan tepat waktu jadi syarat.
 */
export function expireOvertimeRequests(): number {
  const { expire_minutes } = getOvertimeSettings();
  const stamp = new Date(Date.now() - expire_minutes * 60_000).toISOString().slice(0, 19).replace("T", " ");
  return db
    .prepare(
      `UPDATE overtime_requests
          SET status = 'ditolak',
              handled_at = datetime(created_at, ?),
              catatan_admin = ?
        WHERE status = 'pending' AND created_at <= ?`,
    )
    .run(
      `+${expire_minutes} minutes`,
      `Ditolak otomatis: tidak ditindaklanjuti dalam ${Math.round(expire_minutes / 60)} jam.`,
      stamp,
    ).changes;
}

export interface OvertimeInput {
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  keterangan: string;
}

export interface OvertimeRow extends OvertimeInput {
  id: number;
  user_id: number;
  name: string;
  email: string;
  jabatan: string;
  status: "pending" | "disetujui" | "ditolak";
  catatan_admin: string;
  created_at: string;
  handled_at: string | null;
  handled_by_name: string | null;
}

/** Ajukan lembur. "duplicate" bila sudah ada pengajuan menunggu di tanggal itu. */
export function createOvertimeRequest(userId: number, input: OvertimeInput): "created" | "duplicate" {
  expireOvertimeRequests();
  const pending = db
    .prepare("SELECT 1 FROM overtime_requests WHERE user_id = ? AND tanggal = ? AND status = 'pending'")
    .get(userId, input.tanggal);
  if (pending) return "duplicate";
  db.prepare(
    "INSERT INTO overtime_requests (user_id, tanggal, jam_mulai, jam_selesai, keterangan) VALUES (?, ?, ?, ?, ?)",
  ).run(userId, input.tanggal, input.jam_mulai, input.jam_selesai, input.keterangan);
  return "created";
}

/** Riwayat lembur milik satu orang, terbaru dulu. */
export function listOwnOvertimeRequests(userId: number, limit = 50): OvertimeRow[] {
  expireOvertimeRequests();
  return db
    .prepare(
      `SELECT r.id, r.user_id, r.tanggal, r.jam_mulai, r.jam_selesai, r.keterangan, r.status,
              r.catatan_admin, r.created_at, r.handled_at, a.name AS handled_by_name,
              u.name, u.email, u.jabatan
         FROM overtime_requests r
         JOIN users u ON u.id = r.user_id
         LEFT JOIN users a ON a.id = r.handled_by
        WHERE r.user_id = ?
        ORDER BY r.tanggal DESC, r.id DESC
        LIMIT ?`,
    )
    .all(userId, limit) as OvertimeRow[];
}

export function countPendingOvertime(): number {
  expireOvertimeRequests();
  return (
    db.prepare("SELECT count(*) AS n FROM overtime_requests WHERE status = 'pending'").get() as {
      n: number;
    }
  ).n;
}

/** Antrean admin: yang menunggu lebih dulu, lalu yang sudah ditangani (terbaru dulu). */
export function listOvertimeRequests(limit = 100): OvertimeRow[] {
  expireOvertimeRequests();
  return db
    .prepare(
      `SELECT r.id, r.user_id, r.tanggal, r.jam_mulai, r.jam_selesai, r.keterangan, r.status,
              r.catatan_admin, r.created_at, r.handled_at, a.name AS handled_by_name,
              u.name, u.email, u.jabatan
         FROM overtime_requests r
         JOIN users u ON u.id = r.user_id
         LEFT JOIN users a ON a.id = r.handled_by
        ORDER BY r.status = 'pending' DESC, r.tanggal DESC, r.id DESC
        LIMIT ?`,
    )
    .all(limit) as OvertimeRow[];
}

/**
 * Tutup satu pengajuan. Hanya baris `pending` yang bisa diputuskan, jadi form basi tidak
 * bisa menyetujui dua kali.
 *
 * shortcut: satu tahap (admin). Tambah kolom `step` di sini kalau approver berjenjang masuk.
 */
export function handleOvertimeRequest(
  id: number,
  adminId: number,
  decision: "disetujui" | "ditolak",
  catatan = "",
): boolean {
  return (
    db
      .prepare(
        `UPDATE overtime_requests
            SET status = ?, handled_by = ?, handled_at = datetime('now'), catatan_admin = ?
          WHERE id = ? AND status = 'pending'`,
      )
      .run(decision, adminId, catatan.trim(), id).changes > 0
  );
}

/** Tarik pengajuan sendiri; hanya yang masih menunggu. */
export function cancelOvertimeRequest(id: number, userId: number): boolean {
  return (
    db.prepare("DELETE FROM overtime_requests WHERE id = ? AND user_id = ? AND status = 'pending'").run(id, userId)
      .changes > 0
  );
}

/**
 * Total menit tugas yang diselesaikan hari ini (Jakarta) — pemicu tombol pengajuan.
 * Kandidat disaring di SQL dulu agar tidak memindai seluruh riwayat; hari sipilnya
 * ditentukan di JS lewat dbDateToIso, sama seperti hitungan lain di berkas ini.
 */
export function completedMinutesToday(userId: number): number {
  const rows = db
    .prepare(
      `SELECT l.completed_at, ac.minutes
         FROM activity_logs l
         JOIN activities ac ON ac.id = l.activity_id
        WHERE l.user_id = ? AND l.status = 'selesai' AND l.completed_at IS NOT NULL
          AND l.completed_at >= datetime('now', '-2 days')`,
    )
    .all(userId) as Array<{ completed_at: string; minutes: number }>;
  const today = todayIso();
  return rows.reduce((sum, row) => (dbDateToIso(row.completed_at) === today ? sum + row.minutes : sum), 0);
}

/** Keputusan lembur yang belum dilihat pemohon (untuk lonceng). */
export function listUnseenOvertimeResults(userId: number): OvertimeRow[] {
  expireOvertimeRequests();
  return db
    .prepare(
      `SELECT r.id, r.user_id, r.tanggal, r.jam_mulai, r.jam_selesai, r.keterangan, r.status,
              r.catatan_admin, r.created_at, r.handled_at, a.name AS handled_by_name
         FROM overtime_requests r
         LEFT JOIN users a ON a.id = r.handled_by
        WHERE r.user_id = ? AND r.status <> 'pending' AND r.seen_at IS NULL
        ORDER BY r.id DESC`,
    )
    .all(userId) as OvertimeRow[];
}

export function markOvertimeResultsSeen(userId: number): number {
  return db
    .prepare("UPDATE overtime_requests SET seen_at = datetime('now') WHERE user_id = ? AND status <> 'pending' AND seen_at IS NULL")
    .run(userId).changes;
}

export interface PositionRow {
  id: number;
  label: string;
}
export function listPositions(): PositionRow[] {
  return db
    .prepare("SELECT id, label FROM positions ORDER BY label COLLATE NOCASE")
    .all() as PositionRow[];
}

/** Add a Posisi/Jabatan. Throws on a duplicate label (SQLITE_CONSTRAINT_UNIQUE). */
export function createPosition(label: string): void {
  db.prepare("INSERT INTO positions (label) VALUES (?)").run(label.trim());
}

/**
 * Rename a Posisi/Jabatan and follow it through to the accounts that use it, so
 * `users.jabatan` stays in sync with the list the dropdown offers.
 */
export function updatePosition(id: number, label: string): boolean {
  return db.transaction(() => {
    const row = db.prepare("SELECT label FROM positions WHERE id = ?").get(id) as
      | { label: string }
      | undefined;
    if (!row) return false;
    const next = label.trim();
    db.prepare("UPDATE positions SET label = ? WHERE id = ?").run(next, id);
    db.prepare("UPDATE users SET jabatan = ? WHERE jabatan = ?").run(next, row.label);
    return true;
  })();
}

/** Remove a Posisi/Jabatan. Accounts keep the text they already have. */
export function deletePosition(id: number): void {
  db.prepare("DELETE FROM positions WHERE id = ?").run(id);
}

export interface PostRow {
  id: number;
  title: string;
  body: string;
  author_id: number;
  created_at: string;
  updated_at: string;
}

export interface PostSummary {
  id: number;
  title: string;
  author_name: string;
  created_at: string;
  updated_at: string;
  position: number;
}

export interface PostWithAuthor extends PostRow {
  author_name: string;
}

export interface LoginLogRow {
  id: number;
  user_id: number;
  ip: string;
  user_agent: string;
  created_at: string;
}

/** User shape for the admin area — never carries the password hash. */
export interface ManagedUser {
  id: number;
  name: string;
  email: string;
  role: 0 | 1 | 2;
  jabatan: string;
  created_at: string;
  last_login: LoginLogRow | null;
}

export function listPosts(limit?: number): PostSummary[] {
  const sql = `SELECT p.id, p.title, p.created_at, p.updated_at, p.position, u.name AS author_name
       FROM posts p JOIN users u ON u.id = p.author_id
       ORDER BY p.created_at DESC, p.id DESC`;
  return (limit ? db.prepare(`${sql} LIMIT ?`).all(limit) : db.prepare(sql).all()) as PostSummary[];
}

/** Admin list: manual order first, filtered by title when `search` is set. */
export function listPostsPage(search: string, limit: number, offset: number): PostSummary[] {
  const where = search ? "WHERE p.title LIKE ? ESCAPE '\\'" : "";
  const params: Array<string | number> = [];
  if (search) params.push(`%${search.replace(/[\\%_]/g, "\\$&")}%`);
  params.push(limit, offset);
  return db
    .prepare(
      `SELECT p.id, p.title, p.created_at, p.updated_at, p.position, u.name AS author_name
       FROM posts p JOIN users u ON u.id = p.author_id
       ${where}
       ORDER BY p.position, p.created_at DESC, p.id DESC
       LIMIT ? OFFSET ?`,
    )
    .all(...params) as PostSummary[];
}

export function countPosts(search: string): number {
  const where = search ? "WHERE title LIKE ? ESCAPE '\\'" : "";
  const row = db
    .prepare(`SELECT count(*) AS total FROM posts ${where}`)
    .get(...(search ? [`%${search.replace(/[\\%_]/g, "\\$&")}%`] : [])) as { total: number };
  return row.total;
}

/** Apply a new order for one page: the given ids replace that slice, all rows renumber. */
export function reorderPosts(pageIds: number[], offset: number): void {
  const all = db.prepare("SELECT id FROM posts ORDER BY position, created_at DESC, id DESC").all() as Array<{
    id: number;
  }>;
  const rest = all.map((row) => row.id).filter((id) => !pageIds.includes(id));
  const ordered = [...rest.slice(0, offset), ...pageIds, ...rest.slice(offset)];

  const update = db.prepare("UPDATE posts SET position = ? WHERE id = ?");
  db.transaction(() => ordered.forEach((id, index) => update.run(index, id)))();
}

export function getPost(id: number): PostWithAuthor | undefined {
  return db
    .prepare(
      `SELECT p.*, u.name AS author_name
       FROM posts p JOIN users u ON u.id = p.author_id
       WHERE p.id = ?`,
    )
    .get(id) as PostWithAuthor | undefined;
}

export function createPost(title: string, body: string, authorId: number): number {
  const info = db
    .prepare(
      `INSERT INTO posts (title, body, author_id, position)
       VALUES (?, ?, ?, (SELECT COALESCE(MIN(position), 1) - 1 FROM posts))`,
    )
    .run(title, body, authorId);
  return Number(info.lastInsertRowid);
}

export function updatePost(id: number, title: string, body: string): void {
  db.prepare("UPDATE posts SET title = ?, body = ?, updated_at = datetime('now') WHERE id = ?").run(title, body, id);
}

export function deletePost(id: number): void {
  db.prepare("DELETE FROM posts WHERE id = ?").run(id);
}

/** Admin-facing user list: explicit columns, so the password hash never leaves the DB. */
export function listUsers(): ManagedUser[] {
  const users = db
    .prepare("SELECT id, name, email, role, jabatan, created_at FROM users ORDER BY role, name COLLATE NOCASE")
    .all() as Array<Omit<ManagedUser, "last_login">>;

  const logs = db
    .prepare("SELECT id, user_id, ip, user_agent, created_at FROM login_logs ORDER BY id DESC")
    .all() as LoginLogRow[];

  const latest = new Map<number, LoginLogRow>();
  for (const log of logs) if (!latest.has(log.user_id)) latest.set(log.user_id, log);

  return users.map((u) => ({ ...u, last_login: latest.get(u.id) ?? null }));
}

export function deleteUser(id: number): void {
  db.transaction(() => {
    db.prepare("DELETE FROM login_logs WHERE user_id = ?").run(id);
    db.prepare("DELETE FROM posts WHERE author_id = ?").run(id);
    db.prepare("DELETE FROM occurrence_notes WHERE user_id = ?").run(id);
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
  })();
}

export function recordLogin(userId: number, ip: string, userAgent: string): void {
  db.prepare("INSERT INTO login_logs (user_id, ip, user_agent) VALUES (?, ?, ?)").run(userId, ip, userAgent);
}

export interface Stats {
  posts: number;
  users: number;
  admins: number;
  level1: number;
  level2: number;
  logins24h: number;
  neverLoggedIn: number;
  /** Work units, excluding the "Instruksi" system unit. */
  categories: number;
  /** Activity types in real work units, excluding the system unit. */
  activities: number;
  /** Activity types carried by at least one person. */
  assignedActivities: number;
  /** Non-admin accounts with no assignment at all — they have an empty workspace. */
  usersWithoutAssignments: number;
}

/**
 * One query for the whole admin overview. Every count is scoped the way the
 * corresponding page scopes it: the "Instruksi" system unit is not a work unit, so its
 * activities never count as coverage here.
 */
export function getStats(): Stats {
  return db
    .prepare(
      `SELECT
         (SELECT count(*) FROM posts) AS posts,
         (SELECT count(*) FROM users) AS users,
         (SELECT count(*) FROM users WHERE role = 0) AS admins,
         (SELECT count(*) FROM users WHERE role = 1) AS level1,
         (SELECT count(*) FROM users WHERE role = 2) AS level2,
         (SELECT count(*) FROM login_logs WHERE created_at >= datetime('now', '-1 day')) AS logins24h,
         (SELECT count(*) FROM users u WHERE NOT EXISTS (SELECT 1 FROM login_logs l WHERE l.user_id = u.id)) AS neverLoggedIn,
         (SELECT count(*) FROM categories WHERE id <> ?) AS categories,
         (SELECT count(*) FROM activities WHERE category_id <> ?) AS activities,
         (SELECT count(DISTINCT g.activity_id)
            FROM assignments g JOIN activities ac ON ac.id = g.activity_id
           WHERE ac.category_id <> ? AND g.archived_at IS NULL) AS assignedActivities,
         (SELECT count(*) FROM users u
           WHERE u.role <> 0
             AND NOT EXISTS (SELECT 1 FROM assignments g WHERE g.user_id = u.id AND g.archived_at IS NULL)) AS usersWithoutAssignments`,
    )
    .get(DIRECT_CATEGORY, DIRECT_CATEGORY, DIRECT_CATEGORY) as Stats;
}

export interface CategoryCoverage {
  id: string;
  label: string;
  icon: string;
  /** Activity types defined for this unit. */
  activities: number;
  /** How many of them are carried by at least one person. */
  assigned: number;
  /** Distinct people carrying anything from this unit. */
  people: number;
}

/** Per-unit coverage: the whole "where is work still unassigned" question in one read. */
export function listCategoryCoverage(): CategoryCoverage[] {
  return db
    .prepare(
      `SELECT c.id, c.label, c.icon,
              count(DISTINCT ac.id) AS activities,
              count(DISTINCT g.activity_id) AS assigned,
              count(DISTINCT g.user_id) AS people
       FROM categories c
       LEFT JOIN activities ac ON ac.category_id = c.id
       LEFT JOIN assignments g ON g.activity_id = ac.id AND g.archived_at IS NULL
       WHERE c.id <> ?
       GROUP BY c.id
       ORDER BY c.position, c.label COLLATE NOCASE`,
    )
    .all(DIRECT_CATEGORY) as CategoryCoverage[];
}

/**
 * Successful logins per Jakarta day for the last `days` days, oldest first. Buckets
 * are built in JS from the UTC timestamp so an early-morning Jakarta login lands on the
 * day the admin experienced, not the UTC one.
 */
export function loginTrend(days = 7): Array<{ date: string; count: number }> {
  const rows = db
    .prepare("SELECT created_at FROM login_logs WHERE created_at >= datetime('now', ?)")
    .all(`-${days} day`) as Array<{ created_at: string }>;

  const buckets = new Map<string, number>();
  for (const row of rows) {
    const date = dbDateToIso(row.created_at);
    buckets.set(date, (buckets.get(date) ?? 0) + 1);
  }

  const today = new Date(`${todayIso()}T00:00:00Z`);
  const out: Array<{ date: string; count: number }> = [];
  for (let back = days - 1; back >= 0; back--) {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() - back);
    const date = day.toISOString().slice(0, 10);
    out.push({ date, count: buckets.get(date) ?? 0 });
  }
  return out;
}

export interface LoginActivity {
  id: number;
  name: string;
  email: string;
  ip: string;
  user_agent: string;
  created_at: string;
}

export function listRecentLogins(limit = 6): LoginActivity[] {
  return db
    .prepare(
      `SELECT l.id, l.ip, l.user_agent, l.created_at, u.name, u.email
       FROM login_logs l JOIN users u ON u.id = l.user_id
       ORDER BY l.id DESC LIMIT ?`,
    )
    .all(limit) as LoginActivity[];
}

export interface ActivityRow {
  id: number;
  category_id: string;
  name: string;
  start_date: string;
  end_date: string;
  utama: number;
  periodik: number;
  bukan_tupoksi: number;
  periode: Periode;
  frequency: number;
  minutes: number;
  sdm: number;
  volume: number;
  created_at: string;
}

export function listActivities(categoryId: string): ActivityRow[] {
  return db
    .prepare("SELECT * FROM activities WHERE category_id = ? ORDER BY start_date DESC, id DESC")
    .all(categoryId) as ActivityRow[];
}

export function createActivity(categoryId: string, input: ActivityInput): number {
  const info = db
    .prepare(
      `INSERT INTO activities (category_id, name, start_date, end_date, utama, periodik, bukan_tupoksi, periode, frequency, minutes, sdm, volume)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      categoryId,
      input.name,
      input.start_date,
      input.end_date,
      Number(input.utama),
      Number(input.periodik),
      Number(input.bukan_tupoksi),
      input.periode,
      input.frequency,
      input.minutes,
      input.sdm,
      input.volume,
    );
  return Number(info.lastInsertRowid);
}

/** Scoped by category so a tampered id can't touch another unit's rows. */
export function updateActivity(id: number, categoryId: string, input: ActivityInput): void {
  db.prepare(
    `UPDATE activities
     SET name = ?, start_date = ?, end_date = ?, utama = ?, periodik = ?, bukan_tupoksi = ?, periode = ?,
         frequency = ?, minutes = ?, sdm = ?, volume = ?
     WHERE id = ? AND category_id = ?`,
  ).run(
    input.name,
    input.start_date,
    input.end_date,
    Number(input.utama),
    Number(input.periodik),
    Number(input.bukan_tupoksi),
    input.periode,
    input.frequency,
    input.minutes,
    input.sdm,
    input.volume,
    id,
    categoryId,
  );
}

/** Scoped by category so a tampered id can't delete another unit's row. */
export function deleteActivity(id: number, categoryId: string): void {
  db.transaction(() => {
    db.prepare("DELETE FROM occurrence_notes WHERE activity_id = ?").run(id);
    db.prepare("DELETE FROM activities WHERE id = ? AND category_id = ?").run(id, categoryId);
  })();
}

// ---------------------------------------------------------------------------
// Penugasan: which user carries which activities of which work unit.
// One row per (user, activity); the unit rides along on the activity.
// ---------------------------------------------------------------------------

export interface AssignmentUserRow {
  id: number;
  name: string;
  email: string;
  activity_count: number;
  unit_count: number;
}

/** One row per user that carries at least one activity. */
export function listAssignmentUsers(): AssignmentUserRow[] {
  return db
    .prepare(
      `SELECT u.id, u.name, u.email,
              count(g.id) AS activity_count,
              count(DISTINCT g.category_id) AS unit_count
       FROM assignments g JOIN users u ON u.id = g.user_id
       WHERE g.archived_at IS NULL
       GROUP BY u.id
       ORDER BY u.name COLLATE NOCASE`,
    )
    .all() as AssignmentUserRow[];
}

/** Every activity of a user, grouped later by unit. */
export function listAssignedActivitiesForUser(userId: number) {
  return db
    .prepare(
      `SELECT ac.id, ac.name, ac.periode, ac.category_id
       FROM assignments g JOIN activities ac ON ac.id = g.activity_id
       WHERE g.user_id = ? AND g.archived_at IS NULL
       ORDER BY ac.category_id, ac.name COLLATE NOCASE`,
    )
    .all(userId) as Array<{ id: number; name: string; periode: string; category_id: string }>;
}

/**
 * Every activity with the unit it belongs to, plus a flag telling whether this user
 * already carries it. One query feeds the whole picker (unit panels + disabled state).
 */
export function listActivityCatalog(userId: number) {
  return db
    .prepare(
      `SELECT ac.id, ac.name, ac.category_id, ac.periode,
              COALESCE((SELECT 1 FROM assignments g WHERE g.activity_id = ac.id AND g.user_id = ? AND g.archived_at IS NULL), 0) AS assigned

       FROM activities ac ORDER BY ac.name COLLATE NOCASE`,
    )
    .all(userId) as Array<{ id: number; name: string; category_id: string; periode: string; assigned: number }>;
}

/**
 * Insert one assignment per (user, activity) pair. The unit is derived from the
 * activity row itself, so a tampered category in the form cannot attach an activity
 * to another unit. Pairs that already exist are skipped by UNIQUE(user_id,
 * activity_id), so the caller only reports how many were actually new.
 *
 * An archived pair is revived instead of skipped: giving someone an activity again
 * must bring it back to their dashboard. `created_at` restarts so the archived stretch
 * does not count as missed periods.
 */
export function createAssignmentsBulk(
  userIds: number[],
  activityIds: number[],
  createdBy: number | null = null,
  origin = "",
): number {
  const lookup = db.prepare("SELECT category_id FROM activities WHERE id = ?");
  const insert = db.prepare(
    `INSERT INTO assignments (user_id, category_id, activity_id, created_by, origin) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT (user_id, activity_id) DO UPDATE
       SET archived_at = NULL, seen_at = NULL, created_at = datetime('now'),
           created_by = excluded.created_by, origin = excluded.origin
       WHERE archived_at IS NOT NULL`,
  );
  let added = 0;
  db.transaction(() => {
    for (const activityId of activityIds) {
      const row = lookup.get(activityId) as { category_id: string } | undefined;
      if (!row) continue;
      for (const userId of userIds) {
        added += insert.run(userId, row.category_id, activityId, createdBy, origin).changes;
      }
    }
  })();
  return added;
}

/**
 * Insert one assignment per chosen activity for a single user.
 *
 * `createdBy` is recorded so the recipient can see who handed the task over. The origin
 * stays "" — these come from the shared catalog, so they must not show up in the
 * Instruksi tracker or become removable through `deleteDirectAssignment`.
 */
export function createAssignments(
  userId: number,
  activityIds: number[],
  createdBy: number | null = null,
): number {
  return createAssignmentsBulk([userId], activityIds, createdBy);
}

// ---------------------------------------------------------------------------
// Notifikasi "pekerjaan masuk": penugasan yang belum dibaca pemegangnya.
// Satuannya penugasan, bukan kemunculan — tugas harian tidak boleh membunyikan
// lonceng setiap hari.
// ---------------------------------------------------------------------------

/** Satu penugasan yang belum dibaca. Ikon unitnya diselesaikan di halaman. */
export interface NewAssignment {
  id: number;
  activity_id: number;
  name: string;
  category_id: string;
  periode: string;
  created_at: string;
  /** Siapa yang memberi; null untuk baris lama yang diberikan sistem. */
  giver_name: string | null;
  giver_email: string | null;
}

/** Jumlah penugasan yang belum dibaca — angka di lonceng. */
export function countUnseenAssignments(userId: number): number {
  const row = db
    .prepare("SELECT count(*) AS n FROM assignments WHERE user_id = ? AND archived_at IS NULL AND seen_at IS NULL")
    .get(userId) as { n: number };
  return row.n;
}

/** Penugasan yang belum dibaca, terbaru dulu. */
export function listNewAssignments(userId: number): NewAssignment[] {
  return db
    .prepare(
      `SELECT g.id, g.activity_id, ac.name, g.category_id, ac.periode, g.created_at,
              gv.name AS giver_name, gv.email AS giver_email
       FROM assignments g
       JOIN activities ac ON ac.id = g.activity_id
       LEFT JOIN users gv ON gv.id = g.created_by
       WHERE g.user_id = ? AND g.archived_at IS NULL AND g.seen_at IS NULL
       ORDER BY g.created_at DESC, g.id DESC`,
    )
    .all(userId) as NewAssignment[];
}

/**
 * Tandai semua penugasan user sudah dibaca. Balikan jumlah baris yang berubah.
 * Lonceng kini juga membawa hasil lembur, jadi keduanya ditandai bersama.
 */
export function markNotificationsSeen(userId: number): number {
  const assignments = db
    .prepare("UPDATE assignments SET seen_at = datetime('now') WHERE user_id = ? AND archived_at IS NULL AND seen_at IS NULL")
    .run(userId).changes;
  return assignments + markOvertimeResultsSeen(userId);
}

// ---------------------------------------------------------------------------
// Instruksi: aktivitas master yang lahir bersama penugasannya.
// Hidup di unit sistem DIRECT_CATEGORY, dan mencatat siapa yang memberikannya.
// ---------------------------------------------------------------------------

/**
 * Buat aktivitas + tugaskan, dalam satu transaksi.
 *
 * Nama (tanpa peduli huruf besar/kecil) + periode yang sama di unit sistem dipakai
 * ulang, bukan diduplikasi — "Buat MasterDB" justru soal master yang bersih.
 *
 * shortcut: kecocokan mengabaikan rentang berlaku, jadi dua pekerjaan dengan nama &
 * periode sama dianggap satu definisi. Cocokkan `start_date`/`end_date` juga kalau kelak
 * perlu varian tanggal.
 */
export function createDirectAssignment(
  input: ActivityInput,
  userIds: number[],
  createdBy: number | null,
): { activityId: number; created: boolean; added: number; skipped: number } {
  return db.transaction(() => {
    const existing = db
      .prepare(
        `SELECT id FROM activities
         WHERE category_id = ? AND periode = ? AND name = ? COLLATE NOCASE
         LIMIT 1`,
      )
      .get(DIRECT_CATEGORY, input.periode, input.name) as { id: number } | undefined;

    const created = !existing;
    const activityId = existing?.id ?? createActivity(DIRECT_CATEGORY, input);

    const added = createAssignmentsBulk(userIds, [activityId], createdBy, "langsung");
    return {
      activityId,
      created,
      added,
      skipped: userIds.length - added,
    };
  })();
}

/** Satu periode dalam riwayat sebuah penugasan. */
export type PeriodState = "selesai" | "terlewat" | "berjalan";

export interface GivenPeriod {
  key: string;
  state: PeriodState;
  /** Hari periode itu seharusnya selesai. */
  due: string;
  completed_at: string | null;
}

export interface GivenAssignmentRow {
  id: number;
  activity_id: number;
  name: string;
  periode: Periode;
  created_at: string;
  /** Rentang berlaku aktivitas; "" = terbuka. */
  start_date: string;
  end_date: string;
  user_id: number;
  user_name: string;
  user_email: string;
  jabatan: string;
  /** Periode terlama → terbaru, untuk strip timeline. */
  periods: GivenPeriod[];
  done: number;
  missed: number;
  /** Periode berjalan yang belum dicentang. */
  open: number;
  /** Ringkasan: belum mulai → belum; ada yang terlewat → terlambat; beres semua → selesai. */
  status: "belum" | "selesai" | "berjalan" | "terlambat";
}

/**
 * Instruksi yang diberikan satu orang, beserta progres tiap periode.
 *
 * Progres dihitung dari `activity_logs` di sini, bukan dengan membaca hasil
 * `materializeOverdue` — fungsi itu hanya berjalan saat penerima membuka berandanya,
 * jadi pemberi akan melihat "belum ada yang terlewat" untuk pegawai yang tidak pernah
 * login. Rumus periodenya sama (`pastPeriods` + `currentPeriod`), jadi angkanya tetap
 * cocok dengan yang dilihat penerima.
 *
 * Diurutkan dari yang paling perlu perhatian: ada periode terlewat lebih dulu.
 */
export function listGivenAssignments(createdBy: number, onlyUnfinished = false): GivenAssignmentRow[] {
  const rows = db
    .prepare(
      `SELECT g.id, g.activity_id, g.created_at, g.user_id,
              ac.name, ac.periode, ac.start_date, ac.end_date,
              u.name AS user_name, u.email AS user_email, u.jabatan
       FROM assignments g
       JOIN activities ac ON ac.id = g.activity_id
       JOIN users u ON u.id = g.user_id
       WHERE g.created_by = ? AND g.origin = 'langsung' AND g.archived_at IS NULL
       ORDER BY g.created_at DESC, g.id DESC`,
    )
    .all(createdBy) as Array<{
    id: number;
    activity_id: number;
    created_at: string;
    user_id: number;
    name: string;
    periode: Periode;
    start_date: string;
    end_date: string;
    user_name: string;
    user_email: string;
    jabatan: string;
  }>;

  if (rows.length === 0) return [];

  const logs = db
    .prepare(
      `SELECT l.activity_id, l.user_id, l.period_key, l.status, l.completed_at
       FROM activity_logs l
       JOIN assignments g ON g.user_id = l.user_id AND g.activity_id = l.activity_id
       WHERE g.created_by = ? AND g.origin = 'langsung' AND g.archived_at IS NULL`,
    )
    .all(createdBy) as Array<{
    activity_id: number;
    user_id: number;
    period_key: string;
    status: "selesai" | "terlewat";
    completed_at: string | null;
  }>;

  const index = new Map(logs.map((log) => [`${log.user_id}|${log.activity_id}|${log.period_key}`, log]));
  const today = todayIso();

  const out = rows.map((row): GivenAssignmentRow => {
    // Rentang berlaku: mulai paling cepat pada start_date, dan berhenti pada end_date.
    // Tugas yang belum mulai belum punya periode sama sekali; yang sudah lewat tenggat
    // punya periode terakhir di sekitar end_date, bukan periode hari ini.
    const given = dbDateToIso(row.created_at);
    const from = row.start_date && row.start_date > given ? row.start_date : given;
    const notStarted = row.start_date !== "" && today < row.start_date;
    const ended = row.end_date !== "" && today > row.end_date;
    const anchor = ended ? row.end_date : today;
    const boundary = currentPeriod(row.periode, anchor);

    const keys: Array<{ key: string; current: boolean }> = notStarted
      ? []
      : [
          ...pastPeriods(row.periode, from, boundary, row.end_date).map((period) => ({
            key: period.key,
            current: false,
          })),
          { key: boundary.key, current: !ended },
        ];

    const periods: GivenPeriod[] = keys.map(({ key, current: isCurrent }) => {
      const log = index.get(`${row.user_id}|${row.activity_id}|${key}`);
      // Periode lampau tanpa log = terlewat, meski `materializeOverdue` belum sempat
      // mencatatnya. Itu yang akan dilihat penerima begitu ia membuka berandanya.
      const state: PeriodState =
        log?.status === "selesai" ? "selesai" : log?.status === "terlewat" || !isCurrent ? "terlewat" : "berjalan";
      return {
        key,
        state,
        due: dueDate(row.periode, periodFromKey(row.periode, key), row.start_date, row.end_date),
        completed_at: log?.status === "selesai" ? (log.completed_at ?? null) : null,
      };
    });

    const done = periods.filter((period) => period.state === "selesai").length;
    const missed = periods.filter((period) => period.state === "terlewat").length;
    const open = periods.filter((period) => period.state === "berjalan").length;

    return {
      id: row.id,
      activity_id: row.activity_id,
      name: row.name,
      periode: row.periode,
      created_at: row.created_at,
      start_date: row.start_date,
      end_date: row.end_date,
      user_id: row.user_id,
      user_name: row.user_name,
      user_email: row.user_email,
      jabatan: row.jabatan,
      periods,
      done,
      missed,
      open,
      status: notStarted ? "belum" : missed > 0 ? "terlambat" : open > 0 ? "berjalan" : "selesai",
    };
  });

  const filtered = onlyUnfinished ? out.filter((row) => row.status !== "selesai") : out;
  // Yang punya terlewat didahulukan; sisanya tetap terbaru dulu (urutan dari query).
  return [...filtered].sort((a, b) => Number(b.missed > 0) - Number(a.missed > 0));
}

/**
 * Lepas satu instruksi. Hanya baris yang memang diberikan `createdBy` itu —
 * level 1 tidak boleh mencabut penugasan yang diberikan admin.
 */
export function deleteDirectAssignment(assignmentId: number, createdBy: number): boolean {
  return (
    db
      .prepare("DELETE FROM assignments WHERE id = ? AND created_by = ? AND origin = 'langsung'")
      .run(assignmentId, createdBy).changes > 0
  );
}

/** Un-assign one activity from a user. */
export function deleteAssignmentActivity(userId: number, activityId: number): void {
  db.transaction(() => {
    db.prepare("DELETE FROM occurrence_notes WHERE user_id = ? AND activity_id = ?").run(userId, activityId);
    db.prepare("DELETE FROM assignments WHERE user_id = ? AND activity_id = ?").run(userId, activityId);
  })();
}

/**
 * Un-assign everything a user still carries. Archived rows are left alone: they are
 * not on screen, so a click here must not silently destroy them.
 */
export function deleteAssignment(userId: number): void {
  db.transaction(() => {
    db.prepare(
      `DELETE FROM occurrence_notes
       WHERE user_id = ? AND activity_id IN (
         SELECT activity_id FROM assignments WHERE user_id = ? AND archived_at IS NULL
       )`,
    ).run(userId, userId);
    db.prepare("DELETE FROM assignments WHERE user_id = ? AND archived_at IS NULL").run(userId);
  })();
}

// ---------------------------------------------------------------------------
// Arsip penugasan: barisnya tetap ada (catatan & riwayat utuh), hanya disembunyikan
// dari dasbor dan lonceng pemegangnya.
// ---------------------------------------------------------------------------

/** Arsipkan satu penugasan yang masih aktif. Balikan false kalau barisnya tidak ada. */
export function archiveAssignment(userId: number, activityId: number): boolean {
  return (
    db
      .prepare(
        `UPDATE assignments SET archived_at = datetime('now')
         WHERE user_id = ? AND activity_id = ? AND archived_at IS NULL`,
      )
      .run(userId, activityId).changes > 0
  );
}

/**
 * Pulihkan satu penugasan yang diarsipkan.
 *
 * `created_at` ikut direset: periode dihitung dari tanggal penugasan, jadi masa arsip
 * akan langsung terbaca sebagai puluhan periode terlewat. Dipulihkan = mulai hari ini.
 */
export function restoreAssignment(userId: number, activityId: number): boolean {
  return (
    db
      .prepare(
        `UPDATE assignments
         SET archived_at = NULL, seen_at = NULL, created_at = datetime('now')
         WHERE user_id = ? AND activity_id = ? AND archived_at IS NOT NULL`,
      )
      .run(userId, activityId).changes > 0
  );
}

/** Aktivitas yang diarsipkan dari satu user, terbaru diarsipkan lebih dulu. */
export function listArchivedActivitiesForUser(userId: number) {
  return db
    .prepare(
      `SELECT ac.id, ac.name, ac.periode, ac.category_id, g.archived_at
       FROM assignments g JOIN activities ac ON ac.id = g.activity_id
       WHERE g.user_id = ? AND g.archived_at IS NOT NULL
       ORDER BY g.archived_at DESC, ac.name COLLATE NOCASE`,
    )
    .all(userId) as Array<{
    id: number;
    name: string;
    periode: string;
    category_id: string;
    archived_at: string;
  }>;
}

// ---------------------------------------------------------------------------
// Log aktivitas: catatan "selesai" / "terlewat" per kemunculan.
// Satu baris per (user, activity, period_key) — jadi satu tugas tidak bisa dihitung
// dua kali untuk periode yang sama.
// ---------------------------------------------------------------------------

export interface ActivityLogRow {
  id: number;
  user_id: number;
  activity_id: number;
  period_key: string;
  status: "selesai" | "terlewat";
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Satu kemunculan dari aktivitas yang dipegang user, untuk periode berjalan. */
export interface UserOccurrence {
  activity_id: number;
  name: string;
  category_id: string;
  periode: Periode;
  minutes: number;
  sdm: number;
  period_key: string;
  period_start: string;
  period_end: string;
  /** Hari tugas itu harus selesai. */
  due: string;
  status: "open" | "selesai";
  completed_at: string | null;
  /** Selesai setelah hari jatuh tempo — tetap tercatat, tapi ditandai terlambat. */
  late: boolean;
  /** Catatan & tautan yang menempel pada kemunculan ini. */
  note: string;
  link: string;
  /** Siapa yang menugaskan; null untuk baris lama tanpa pemberi. */
  giver_name: string | null;
  giver_email: string | null;
}

/** Kemunculan yang terlewat dari satu aktivitas, digabung jadi satu baris. */
export interface MissedTask {
  activity_id: number;
  name: string;
  category_id: string;
  periode: Periode;
  count: number;
  /** Periode terlewat yang paling akhir. */
  last_key: string;
  last_due: string;
  /** Semua periode yang terlewat, terbaru dulu — satu per kemunculan. */
  periods: string[];
}

export interface HistoryRow {
  id: number;
  activity_id: number;
  name: string;
  category_id: string;
  periode: Periode;
  period_key: string;
  period_start: string;
  period_end: string;
  status: "selesai" | "terlewat";
  completed_at: string | null;
  late: boolean;
  /** Catatan & tautan yang menempel pada kemunculan ini. */
  note: string;
  link: string;
}

/**
 * Catat setiap periode yang sudah lewat tanpa penyelesaian sebagai "terlewat". Dijalankan
 * saat dashboard user dibuka — idempoten (UNIQUE), jadi aman diulang.
 */
export function materializeOverdue(userId: number): void {
  const rows = db
    .prepare(
      `SELECT g.activity_id, g.created_at, ac.periode, ac.start_date, ac.end_date
       FROM assignments g JOIN activities ac ON ac.id = g.activity_id
       WHERE g.user_id = ? AND g.archived_at IS NULL`,
    )
    .all(userId) as Array<{
    activity_id: number;
    created_at: string;
    periode: Periode;
    start_date: string;
    end_date: string;
  }>;

  const today = todayIso();
  const insert = db.prepare(
    `INSERT OR IGNORE INTO activity_logs (user_id, activity_id, period_key, status)
     VALUES (?, ?, ?, 'terlewat')`,
  );

  db.transaction(() => {
    for (const row of rows) {
      const given = dbDateToIso(row.created_at);
      const from = row.start_date && row.start_date > given ? row.start_date : given;
      // Tugas yang belum mulai belum punya periode untuk dicatat.
      if (row.start_date && today < row.start_date) continue;
      // Tugas yang tenggatnya sudah lewat berhenti di periode yang memuat end_date.
      const anchor = row.end_date && today > row.end_date ? row.end_date : today;
      const boundary = currentPeriod(row.periode, anchor);
      for (const period of pastPeriods(row.periode, from, boundary, row.end_date)) {
        insert.run(userId, row.activity_id, period.key);
      }
      // Tenggat yang sudah lewat: periode terakhirnya ikut dicatat sebagai terlewat,
      // supaya penerima melihatnya sekali, bukan menghilang tanpa jejak.
      if (row.end_date && today > row.end_date) {
        insert.run(userId, row.activity_id, boundary.key);
      }
    }
  })();
}

/** Kemunculan setiap aktivitas yang dipegang user, untuk periode berjalan. */
export function listUserOccurrences(userId: number): UserOccurrence[] {
  const rows = db
    .prepare(
      `SELECT ac.id AS activity_id, ac.name, ac.category_id, ac.periode, ac.minutes, ac.sdm,
              ac.start_date, ac.end_date,
              gv.name AS giver_name, gv.email AS giver_email
       FROM assignments g
       JOIN activities ac ON ac.id = g.activity_id
       LEFT JOIN users gv ON gv.id = g.created_by
       WHERE g.user_id = ? AND g.archived_at IS NULL
       ORDER BY ac.category_id, ac.name COLLATE NOCASE`,
    )
    .all(userId) as Array<{
    activity_id: number;
    name: string;
    category_id: string;
    periode: Periode;
    minutes: number;
    sdm: number;
    start_date: string;
    end_date: string;
    giver_name: string | null;
    giver_email: string | null;
  }>;

  const today = todayIso();
  const logs = db
    .prepare("SELECT activity_id, period_key, status, completed_at FROM activity_logs WHERE user_id = ?")
    .all(userId) as Array<{
    activity_id: number;
    period_key: string;
    status: "selesai" | "terlewat";
    completed_at: string | null;
  }>;
  const index = new Map(logs.map((log) => [`${log.activity_id}|${log.period_key}`, log]));
  const notes = listOccurrenceNotes(userId);

  return rows
    .flatMap((row) => {
      // Tugas di luar rentang berlakunya tidak punya kemunculan hari ini: belum mulai
      // atau sudah lewat tenggat. Yang sudah lewat tetap tercatat di riwayat/panel
      // pemberi, tapi tidak lagi muncul sebagai tugas berjalan.
      const period = activePeriod(row.periode, today, { start: row.start_date, end: row.end_date });
      if (!period) return [];

      const due = dueDate(row.periode, period, row.start_date, row.end_date);
      const log = index.get(`${row.activity_id}|${period.key}`);
      const done = log?.status === "selesai";
      const completedAt = done ? log.completed_at : null;
      const note = notes.get(`${row.activity_id}|${period.key}`);
      return [
        {
          ...row,
          period_key: period.key,
          period_start: period.start,
          period_end: period.end,
          due,
          status: (done ? "selesai" : "open") as "selesai" | "open",
          completed_at: completedAt,
          late: completedAt ? dbDateToIso(completedAt) > due : false,
          note: note?.note ?? "",
          link: note?.link ?? "",
        },
      ];
    });
}

export interface UpcomingAssignment {
  activity_id: number;
  name: string;
  category_id: string;
  periode: Periode;
  minutes: number;
  start_date: string;
  end_date: string;
  giver_name: string | null;
  giver_email: string | null;
}

/**
 * Penugasan yang tanggal mulainya belum tiba. Tidak punya kemunculan (lihat
 * `activePeriod`), jadi tanpa daftar ini penerima tidak melihat apa pun sampai
 * harinya tiba — instruksi yang baru masuk terasa hilang.
 */
export function listUpcomingAssignments(userId: number): UpcomingAssignment[] {
  return db
    .prepare(
      `SELECT ac.id AS activity_id, ac.name, ac.category_id, ac.periode, ac.minutes,
              ac.start_date, ac.end_date,
              gv.name AS giver_name, gv.email AS giver_email
       FROM assignments g
       JOIN activities ac ON ac.id = g.activity_id
       LEFT JOIN users gv ON gv.id = g.created_by
       WHERE g.user_id = ? AND g.archived_at IS NULL AND ac.start_date > ?
       ORDER BY ac.start_date, ac.name COLLATE NOCASE`,
    )
    .all(userId, todayIso()) as UpcomingAssignment[];
}

/** Catatan & tautan satu kemunculan (kosong kalau belum ada). */
export interface OccurrenceNote {
  note: string;
  link: string;
}

const noteKey = (activityId: number, periodKey: string) => `${activityId}|${periodKey}`;

/** Semua catatan satu user, dikunci kemunculan (activity + periode). */
export function listOccurrenceNotes(userId: number): Map<string, OccurrenceNote> {
  const rows = db
    .prepare("SELECT activity_id, period_key, note, link FROM occurrence_notes WHERE user_id = ?")
    .all(userId) as Array<{ activity_id: number; period_key: string; note: string; link: string }>;
  return new Map(rows.map((row) => [noteKey(row.activity_id, row.period_key), { note: row.note, link: row.link }]));
}

/**
 * Simpan catatan & tautan satu kemunculan. Keduanya kosong berarti catatan dihapus —
 * fungsi mengembalikan true kalau catatan memang dihapus.
 */
export function setOccurrenceNote(
  userId: number,
  activityId: number,
  periodKey: string,
  note: string,
  link: string,
): boolean {
  if (!note && !link) {
    const info = db
      .prepare("DELETE FROM occurrence_notes WHERE user_id = ? AND activity_id = ? AND period_key = ?")
      .run(userId, activityId, periodKey);
    return info.changes > 0;
  }

  db.prepare(
    `INSERT INTO occurrence_notes (user_id, activity_id, period_key, note, link)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT (user_id, activity_id, period_key)
     DO UPDATE SET note = excluded.note, link = excluded.link, updated_at = datetime('now')`,
  ).run(userId, activityId, periodKey, note, link);
  return false;
}

/** Aktivitas yang punya kemunculan terlewat, digabung per aktivitas. */
export function listMissedTasks(userId: number): MissedTask[] {
  const rows = db
    .prepare(
      `SELECT l.activity_id, ac.name, ac.category_id, ac.periode, count(*) AS c, max(l.period_key) AS last_key,
              group_concat(l.period_key) AS keys
       FROM activity_logs l
       JOIN activities ac ON ac.id = l.activity_id
       JOIN assignments g ON g.activity_id = l.activity_id AND g.user_id = l.user_id
       WHERE l.user_id = ? AND l.status = 'terlewat' AND g.archived_at IS NULL
       GROUP BY l.activity_id`,
    )
    .all(userId) as Array<{
    activity_id: number;
    name: string;
    category_id: string;
    periode: Periode;
    c: number;
    last_key: string;
    keys: string;
  }>;

  return rows
    .map((row) => ({
      activity_id: row.activity_id,
      name: row.name,
      category_id: row.category_id,
      periode: row.periode,
      count: row.c,
      last_key: row.last_key,
      last_due: periodFromKey(row.periode, row.last_key).end,
      // Periodes satu aktivitas satu jenis, jadi urut lexicografik sama dengan urut waktu.
      periods: row.keys.split(",").sort().reverse(),
    }))
    .sort((a, b) => b.last_due.localeCompare(a.last_due));
}

/**
 * Tandai satu kemunculan selesai. Hanya periode berjalan atau periode yang sudah
 * tercatat terlewat yang boleh diselesaikan — jadi user tidak bisa menandai periode
 * yang tidak pernah ada.
 */
export function completeOccurrence(
  userId: number,
  activityId: number,
  periodKey: string,
): "selesai" | "terlambat" | "invalid" {
  const activity = db
    .prepare(
      `SELECT ac.periode, ac.start_date, ac.end_date
       FROM assignments g JOIN activities ac ON ac.id = g.activity_id
       WHERE g.user_id = ? AND g.activity_id = ? AND g.archived_at IS NULL`,
    )
    .get(userId, activityId) as
    | { periode: Periode; start_date: string; end_date: string }
    | undefined;
  if (!activity) return "invalid";

  const today = todayIso();
  const current = currentPeriod(activity.periode, today);
  const existing = db
    .prepare("SELECT status FROM activity_logs WHERE user_id = ? AND activity_id = ? AND period_key = ?")
    .get(userId, activityId, periodKey) as { status: "selesai" | "terlewat" } | undefined;

  if (periodKey !== current.key && existing?.status !== "terlewat") return "invalid";

  const due = dueDate(
    activity.periode,
    periodFromKey(activity.periode, periodKey),
    activity.start_date,
    activity.end_date,
  );
  const late = today > due;

  db.prepare(
    `INSERT INTO activity_logs (user_id, activity_id, period_key, status, completed_at, updated_at)
     VALUES (?, ?, ?, 'selesai', datetime('now'), datetime('now'))
     ON CONFLICT (user_id, activity_id, period_key)
     DO UPDATE SET status = 'selesai', completed_at = datetime('now'), updated_at = datetime('now')`,
  ).run(userId, activityId, periodKey);

  return late ? "terlambat" : "selesai";
}

/**
 * Batalkan tanda selesai. Mengembalikan ke mana kemunculannya kembali:
 * "terlewat" kalau periodenya sudah lewat (periode itu dicatat terlewat lagi),
 * "open" kalau periodenya masih berjalan (tugasnya terbuka lagi).
 */
export function undoOccurrence(
  userId: number,
  activityId: number,
  periodKey: string,
): "terlewat" | "open" | false {
  const info = db
    .prepare(
      `DELETE FROM activity_logs
       WHERE user_id = ? AND activity_id = ? AND period_key = ? AND status = 'selesai'`,
    )
    .run(userId, activityId, periodKey);
  if (info.changes === 0) return false;

  const activity = db
    .prepare(
      `SELECT ac.periode, ac.start_date, ac.end_date
       FROM assignments g JOIN activities ac ON ac.id = g.activity_id
       WHERE g.user_id = ? AND g.activity_id = ? AND g.archived_at IS NULL`,
    )
    .get(userId, activityId) as
    | { periode: Periode; start_date: string; end_date: string }
    | undefined;
  if (!activity) return "open";

  const due = dueDate(
    activity.periode,
    periodFromKey(activity.periode, periodKey),
    activity.start_date,
    activity.end_date,
  );
  return due < todayIso() ? "terlewat" : "open";
}

/** Riwayat log user, terbaru dulu. */
/**
 * Rekap harian kemunculan user — dasar grafik kontribusi.
 *
 * Tugas yang selesai dihitung pada hari penyelesaikannya (seperti commit), tugas
 * terlewat pada hari jatuh temponya — bukan pada hari aplikasi pertama kali
 * mengetahuinya, karena itu akan menumpuk semua kemunculan lama di hari ini.
 */
export function listDailyActivity(userId: number): {
  days: Map<string, { done: number; missed: number }>;
  years: number[];
} {
  const rows = db
    .prepare(
      `SELECT l.status, l.completed_at, l.period_key, ac.periode, ac.start_date, ac.end_date
       FROM activity_logs l JOIN activities ac ON ac.id = l.activity_id
       WHERE l.user_id = ?`,
    )
    .all(userId) as Array<{
    status: "selesai" | "terlewat";
    completed_at: string | null;
    period_key: string;
    periode: Periode;
    start_date: string;
    end_date: string;
  }>;

  const days = new Map<string, { done: number; missed: number }>();
  const bump = (date: string, key: "done" | "missed") => {
    const bucket = days.get(date) ?? { done: 0, missed: 0 };
    bucket[key] += 1;
    days.set(date, bucket);
  };

  for (const row of rows) {
    if (row.status === "selesai") {
      if (!row.completed_at) continue;
      bump(dbDateToIso(row.completed_at), "done");
      continue;
    }
    const period = periodFromKey(row.periode, row.period_key);
    bump(dueDate(row.periode, period, row.start_date, row.end_date), "missed");
  }

  const years = [...new Set([...days.keys()].map((date) => Number(date.slice(0, 4))))].sort(
    (a, b) => b - a,
  );
  return { days, years };
}

/**
 * Rekap harian satu tahun, bentuk objek supaya bisa dikirim ke klien.
 *
 * Grafik hanya menampilkan satu tahun, jadi klien cukup menerima tahun yang sedang
 * dilihat — bukan seluruh riwayat.
 */
export function dailyActivityByYear(
  userId: number,
  year: number,
): Record<string, { done: number; missed: number }> {
  const days = listDailyActivity(userId).days;
  const out: Record<string, { done: number; missed: number }> = {};
  for (const [date, bucket] of days) {
    if (Number(date.slice(0, 4)) === year) out[date] = bucket;
  }
  return out;
}

/**
 * Tugas selesai per Jakarta day for the last `days` days, oldest first. Same buckets
 * `listDailyActivity` uses (completion day for done, due day for missed), so the chart
 * and the contribution graph never disagree.
 */
export function dailyDoneTrend(userId: number, days = 14): Array<{ date: string; count: number }> {
  const buckets = listDailyActivity(userId).days;
  const today = new Date(`${todayIso()}T00:00:00Z`);
  const out: Array<{ date: string; count: number }> = [];
  for (let back = days - 1; back >= 0; back--) {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() - back);
    const date = day.toISOString().slice(0, 10);
    out.push({ date, count: buckets.get(date)?.done ?? 0 });
  }
  return out;
}

export function listHistory(userId: number, status?: "selesai" | "terlewat"): HistoryRow[] {
  const rows = db
    .prepare(
      `SELECT l.id, l.activity_id, l.period_key, l.status, l.completed_at,
              ac.name, ac.category_id, ac.periode, ac.start_date, ac.end_date
       FROM activity_logs l JOIN activities ac ON ac.id = l.activity_id
       WHERE l.user_id = ? ${status ? "AND l.status = ?" : ""}
       LIMIT 300`,
    )
    .all(...(status ? [userId, status] : [userId])) as Array<{
    id: number;
    activity_id: number;
    period_key: string;
    status: "selesai" | "terlewat";
    completed_at: string | null;
    name: string;
    category_id: string;
    periode: Periode;
    start_date: string;
    end_date: string;
  }>;

  const notes = listOccurrenceNotes(userId);

  return rows
    .map((row) => {
      const period = periodFromKey(row.periode, row.period_key);
      const due = dueDate(row.periode, period, row.start_date, row.end_date);
      const note = notes.get(noteKey(row.activity_id, row.period_key));
      return {
        id: row.id,
        activity_id: row.activity_id,
        name: row.name,
        category_id: row.category_id,
        periode: row.periode,
        period_key: row.period_key,
        period_start: period.start,
        period_end: period.end,
        status: row.status,
        completed_at: row.completed_at,
        late: row.status === "selesai" && row.completed_at ? dbDateToIso(row.completed_at) > due : false,
        note: note?.note ?? "",
        link: note?.link ?? "",
      };
    })
    .sort((a, b) => b.period_end.localeCompare(a.period_end) || b.id - a.id);
}

/** Berapa tugas yang selesai di antara dua tanggal (Jakarta). */
export function countCompletedBetween(userId: number, fromIso: string, toIso: string): number {
  const rows = db
    .prepare(
      "SELECT completed_at FROM activity_logs WHERE user_id = ? AND status = 'selesai' AND completed_at IS NOT NULL",
    )
    .all(userId) as Array<{ completed_at: string }>;
  return rows.filter((row) => {
    const day = dbDateToIso(row.completed_at);
    return day >= fromIso && day <= toIso;
  }).length;
}

/**
 * Penghitung rekap di dashboard user — dikirim balik oleh action agar DOM-nya sinkron.
 * "Selesai hari ini" tidak ada di sini: angka itu dihitung dari kartu di halaman,
 * jadi tidak perlu satu pemindaian penugasan penuh setiap kali tugas dicentang.
 */
export interface TaskStats {
  /** Kemunculan yang terlewat. */
  missed: number;
  /** Tugas yang selesai bulan ini. */
  doneMonth: number;
}

export function taskStats(userId: number): TaskStats {
  const today = todayIso();

  return {
    missed: listMissedTasks(userId).reduce((sum, item) => sum + item.count, 0),
    doneMonth: countCompletedBetween(userId, `${today.slice(0, 7)}-01`, today),
  };
}

// ---------------------------------------------------------------------------
// Absensi: satu titik kantor (geofence) + kejadian masuk/pulang per hari.
// ---------------------------------------------------------------------------

/** The single office point, or null while the admin has not set one. */
export function getAttendanceLocation(): AttendanceLocation | null {
  const row = db
    .prepare("SELECT id, label, latitude, longitude, radius_m FROM attendance_location WHERE id = 1")
    .get() as AttendanceLocation | undefined;
  return row ?? null;
}

/** Create or replace the one location. There is no second row to pick. */
export function saveAttendanceLocation(input: LocationValues): void {
  db.prepare(
    `INSERT INTO attendance_location (id, label, latitude, longitude, radius_m, updated_at)
     VALUES (1, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT (id) DO UPDATE SET
       label = excluded.label,
       latitude = excluded.latitude,
       longitude = excluded.longitude,
       radius_m = excluded.radius_m,
       updated_at = excluded.updated_at`,
  ).run(input.label, input.latitude, input.longitude, input.radius_m);
}

export interface AttendanceRow {
  id: number;
  user_id: number;
  tanggal: string;
  kind: "masuk" | "pulang";
  /** Nama kantor saat kejadian itu dicatat — bukan nama sekarang. */
  location_label: string;
  latitude: number;
  longitude: number;
  accuracy_m: number;
  distance_m: number;
  ip: string;
  user_agent: string;
  created_at: string;
}

const ATTENDANCE_COLUMNS = `l.id, l.user_id, l.tanggal, l.kind, l.location_label, l.latitude, l.longitude,
              l.accuracy_m, l.distance_m, l.ip, l.user_agent, l.created_at`;

/** One person's own rows for one day. */
export function listAttendanceForDay(userId: number, tanggal: string): AttendanceRow[] {
  return db
    .prepare(
      `SELECT ${ATTENDANCE_COLUMNS}
         FROM attendance_logs l
        WHERE l.user_id = ? AND l.tanggal = ?
        ORDER BY l.id`,
    )
    .all(userId, tanggal) as AttendanceRow[];
}

export interface AttendanceSnapshot {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  /** true when `kind` was already recorded today. */
  alreadyRecorded: (kind: "masuk" | "pulang") => boolean;
}

/** Today's state for one person, shaped for `judgeAttendance`. */
export function attendanceState(userId: number, tanggal: string): AttendanceSnapshot {
  const kinds = new Set(
    (
      db.prepare("SELECT kind FROM attendance_logs WHERE user_id = ? AND tanggal = ?").all(userId, tanggal) as Array<{
        kind: "masuk" | "pulang";
      }>
    ).map((row) => row.kind),
  );
  return {
    hasCheckedIn: kinds.has("masuk"),
    hasCheckedOut: kinds.has("pulang"),
    alreadyRecorded: (kind) => kinds.has(kind),
  };
}

export interface AttendanceInput {
  kind: "masuk" | "pulang";
  location_label: string;
  latitude: number;
  longitude: number;
  accuracy_m: number;
  distance_m: number;
  ip: string;
  user_agent: string;
}

/** Record one check-in. Returns false when the UNIQUE index already holds that row. */
export function createAttendanceLog(userId: number, tanggal: string, input: AttendanceInput): boolean {
  const info = db
    .prepare(
      `INSERT OR IGNORE INTO attendance_logs
         (user_id, tanggal, kind, location_label, latitude, longitude, accuracy_m, distance_m, ip, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      userId,
      tanggal,
      input.kind,
      input.location_label,
      input.latitude,
      input.longitude,
      input.accuracy_m,
      input.distance_m,
      input.ip,
      input.user_agent,
    );
  return info.changes > 0;
}

/** Recap for one date: every employee row joined with their account, masuk and pulang side by side. */
export interface AttendanceRecapRow {
  user_id: number;
  name: string;
  email: string;
  jabatan: string;
  role: 0 | 1 | 2;
  masuk_at: string | null;
  pulang_at: string | null;
  masuk_location: string | null;
  pulang_location: string | null;
  masuk_distance: number | null;
  pulang_distance: number | null;
  masuk_latitude: number | null;
  masuk_longitude: number | null;
  pulang_latitude: number | null;
  pulang_longitude: number | null;
  masuk_accuracy: number | null;
  pulang_accuracy: number | null;
}

/**
 * The admin search term, as a LIKE pattern. Escaped like `listPostsPage` so a typed
 * `%` or `_` stays literal instead of matching everything.
 */
const likeTerm = (search: string) => `%${search.replace(/[\\%_]/g, "\\$&")}%`;

/** Name/email/jabatan filter for the attendance reports. `q` is already trimmed. */
const attendanceUserFilter = (search: string) =>
  search
    ? ` AND (u.name LIKE ? ESCAPE '\\' OR u.email LIKE ? ESCAPE '\\' OR u.jabatan LIKE ? ESCAPE '\\')`
    : "";

const attendanceUserFilterParams = (search: string) =>
  search ? [likeTerm(search), likeTerm(search), likeTerm(search)] : [];

export function listAttendanceRecap(tanggal: string, search = ""): AttendanceRecapRow[] {
  return db
    .prepare(
      `SELECT u.id AS user_id, u.name, u.email, u.jabatan, u.role,
              mi.created_at AS masuk_at, pu.created_at AS pulang_at,
              mi.location_label AS masuk_location, pu.location_label AS pulang_location,
              mi.distance_m AS masuk_distance, pu.distance_m AS pulang_distance,
              mi.latitude AS masuk_latitude, mi.longitude AS masuk_longitude,
              pu.latitude AS pulang_latitude, pu.longitude AS pulang_longitude,
              mi.accuracy_m AS masuk_accuracy, pu.accuracy_m AS pulang_accuracy
         FROM users u
         LEFT JOIN attendance_logs mi
           ON mi.user_id = u.id AND mi.tanggal = ? AND mi.kind = 'masuk'
         LEFT JOIN attendance_logs pu
           ON pu.user_id = u.id AND pu.tanggal = ? AND pu.kind = 'pulang'
        WHERE u.role <> 0${attendanceUserFilter(search)}
          AND (mi.id IS NOT NULL OR pu.id IS NOT NULL)
        ORDER BY mi.created_at IS NULL, mi.created_at, u.name COLLATE NOCASE`,
    )
    .all(tanggal, tanggal, ...attendanceUserFilterParams(search)) as AttendanceRecapRow[];
}

/** Non-admin accounts with no `masuk` row on `tanggal`. Derived, never stored. */
export interface AttendanceMissingRow {
  id: number;
  name: string;
  email: string;
  jabatan: string;
  role: 0 | 1 | 2;
}

export function listAttendanceMissing(tanggal: string, search = ""): AttendanceMissingRow[] {
  return db
    .prepare(
      `SELECT u.id, u.name, u.email, u.jabatan, u.role
         FROM users u
        WHERE u.role <> 0${attendanceUserFilter(search)}
          AND NOT EXISTS (
            SELECT 1 FROM attendance_logs l
             WHERE l.user_id = u.id AND l.tanggal = ? AND l.kind = 'masuk'
          )
        ORDER BY u.name COLLATE NOCASE`,
    )
    .all(...attendanceUserFilterParams(search), tanggal) as AttendanceMissingRow[];
}

/**
 * Non-admin accounts with no `masuk` row anywhere in `[start, end]` — the monthly and
 * yearly "belum absen" list. A person who came once is not missing, just partly present,
 * so `listAttendanceSummary` is what shows the partial cases.
 */
export function listAttendanceMissingRange(start: string, end: string, search = ""): AttendanceMissingRow[] {
  return db
    .prepare(
      `SELECT u.id, u.name, u.email, u.jabatan, u.role
         FROM users u
        WHERE u.role <> 0${attendanceUserFilter(search)}
          AND NOT EXISTS (
            SELECT 1 FROM attendance_logs l
             WHERE l.user_id = u.id AND l.kind = 'masuk'
               AND l.tanggal BETWEEN ? AND ?
          )
        ORDER BY u.name COLLATE NOCASE`,
    )
    .all(...attendanceUserFilterParams(search), start, end) as AttendanceMissingRow[];
}

/** One person's totals over a range — the row of the monthly and yearly reports. */
export interface AttendanceSummaryRow {
  user_id: number;
  name: string;
  email: string;
  jabatan: string;
  role: 0 | 1 | 2;
  days_in: number;
  days_out: number;
  first_day: string | null;
  last_day: string | null;
}

/**
 * Every non-admin, including those with zero rows: a monthly report that hides the
 * absentees is the one thing the report exists to show. `days_out > days_in` cannot
 * happen — the action refuses `pulang` without `masuk` on the same day.
 */
export function listAttendanceSummary(start: string, end: string, search = ""): AttendanceSummaryRow[] {
  return db
    .prepare(
      `SELECT u.id AS user_id, u.name, u.email, u.jabatan, u.role,
              count(DISTINCT CASE WHEN l.kind = 'masuk'  THEN l.tanggal END) AS days_in,
              count(DISTINCT CASE WHEN l.kind = 'pulang' THEN l.tanggal END) AS days_out,
              min(CASE WHEN l.kind = 'masuk' THEN l.tanggal END) AS first_day,
              max(CASE WHEN l.kind = 'masuk' THEN l.tanggal END) AS last_day
         FROM users u
         LEFT JOIN attendance_logs l
           ON l.user_id = u.id AND l.tanggal BETWEEN ? AND ?
        WHERE u.role <> 0${attendanceUserFilter(search)}
        GROUP BY u.id
        ORDER BY u.name COLLATE NOCASE`,
    )
    .all(start, end, ...attendanceUserFilterParams(search)) as AttendanceSummaryRow[];
}

/** One filled cell of the yearly grid: a person, a month (1–12), a count of days in. */
export interface AttendanceMonthCell {
  user_id: number;
  month: number;
  days_in: number;
}

/** Days present per person per month, for the yearly grid. Flat; the page pivots it. */
export function listAttendanceMonthCells(start: string, end: string, search = ""): AttendanceMonthCell[] {
  return db
    .prepare(
      `SELECT l.user_id, CAST(substr(l.tanggal, 6, 2) AS INTEGER) AS month, count(DISTINCT l.tanggal) AS days_in
         FROM attendance_logs l
         JOIN users u ON u.id = l.user_id
        WHERE l.kind = 'masuk'
          AND l.tanggal BETWEEN ? AND ?${attendanceUserFilter(search)}
        GROUP BY l.user_id, month`,
    )
    .all(start, end, ...attendanceUserFilterParams(search)) as AttendanceMonthCell[];
}

/** One person's own history, newest day first. */
export function listOwnAttendance(userId: number, limit = 60): AttendanceRow[] {
  return db
    .prepare(
      `SELECT ${ATTENDANCE_COLUMNS}
         FROM attendance_logs l
        WHERE l.user_id = ?
        ORDER BY l.tanggal DESC, l.id DESC
        LIMIT ?`,
    )
    .all(userId, limit) as AttendanceRow[];
}

/** Count of non-admins without a `masuk` row today — the admin nav badge. */
export function countAttendanceMissing(tanggal: string): number {
  return listAttendanceMissing(tanggal).length;
}

export { db };

export { db as default };