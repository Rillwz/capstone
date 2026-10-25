import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { ActivityInput, Periode } from "./activities";
import { currentPeriod, dbDateToIso, dueDate, pastPeriods, periodFromKey, todayIso } from "./tasks";

// SQLite database lives in /data at project root.
const dataDir = join(process.cwd(), "data");
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

const db = new Database(join(dataDir, "app.db"));
db.pragma("journal_mode = WAL");

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

  CREATE INDEX IF NOT EXISTS idx_activities_category ON activities (category_id, id);

  CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL,
    activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (user_id, activity_id)
  );

  CREATE INDEX IF NOT EXISTS idx_assignments_user ON assignments (user_id);

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
`);

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

/** Hapus kategori beserta aktivitas, penugasan, log dan catatannya. */
export function deleteCategory(id: string): void {
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
}

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
         (SELECT count(*) FROM users u WHERE NOT EXISTS (SELECT 1 FROM login_logs l WHERE l.user_id = u.id)) AS neverLoggedIn`,
    )
    .get() as Stats;
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
  date: string;
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
    .prepare("SELECT * FROM activities WHERE category_id = ? ORDER BY date DESC, id DESC")
    .all(categoryId) as ActivityRow[];
}

export function createActivity(categoryId: string, input: ActivityInput): number {
  const info = db
    .prepare(
      `INSERT INTO activities (category_id, name, date, utama, periodik, bukan_tupoksi, periode, frequency, minutes, sdm, volume)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      categoryId,
      input.name,
      input.date,
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
     SET name = ?, date = ?, utama = ?, periodik = ?, bukan_tupoksi = ?, periode = ?,
         frequency = ?, minutes = ?, sdm = ?, volume = ?
     WHERE id = ? AND category_id = ?`,
  ).run(
    input.name,
    input.date,
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
       WHERE g.user_id = ?
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
              (SELECT 1 FROM assignments g WHERE g.activity_id = ac.id AND g.user_id = ?) AS assigned
       FROM activities ac ORDER BY ac.name COLLATE NOCASE`,
    )
    .all(userId) as Array<{ id: number; name: string; category_id: string; periode: string; assigned: number }>;
}

/**
 * Insert one assignment per chosen activity. The unit is derived from the activity row
 * itself, so a tampered category in the form cannot attach an activity to another unit.
 */
export function createAssignments(userId: number, activityIds: number[]): number {
  const lookup = db.prepare("SELECT category_id FROM activities WHERE id = ?");
  const insert = db.prepare(
    "INSERT OR IGNORE INTO assignments (user_id, category_id, activity_id) VALUES (?, ?, ?)",
  );
  let added = 0;
  db.transaction(() => {
    for (const activityId of activityIds) {
      const row = lookup.get(activityId) as { category_id: string } | undefined;
      if (row) added += insert.run(userId, row.category_id, activityId).changes;
    }
  })();
  return added;
}

/** Un-assign one activity from a user. */
export function deleteAssignmentActivity(userId: number, activityId: number): void {
  db.transaction(() => {
    db.prepare("DELETE FROM occurrence_notes WHERE user_id = ? AND activity_id = ?").run(userId, activityId);
    db.prepare("DELETE FROM assignments WHERE user_id = ? AND activity_id = ?").run(userId, activityId);
  })();
}

/** Un-assign everything a user carries, across all units. */
export function deleteAssignment(userId: number): void {
  db.transaction(() => {
    db.prepare("DELETE FROM occurrence_notes WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM assignments WHERE user_id = ?").run(userId);
  })();
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
      `SELECT g.activity_id, g.created_at, ac.periode, ac.date
       FROM assignments g JOIN activities ac ON ac.id = g.activity_id
       WHERE g.user_id = ?`,
    )
    .all(userId) as Array<{ activity_id: number; created_at: string; periode: Periode; date: string }>;

  const today = todayIso();
  const insert = db.prepare(
    `INSERT OR IGNORE INTO activity_logs (user_id, activity_id, period_key, status)
     VALUES (?, ?, ?, 'terlewat')`,
  );

  db.transaction(() => {
    for (const row of rows) {
      const current = currentPeriod(row.periode, today);
      for (const period of pastPeriods(row.periode, dbDateToIso(row.created_at), current)) {
        insert.run(userId, row.activity_id, period.key);
      }
    }
  })();
}

/** Kemunculan setiap aktivitas yang dipegang user, untuk periode berjalan. */
export function listUserOccurrences(userId: number): UserOccurrence[] {
  const rows = db
    .prepare(
      `SELECT ac.id AS activity_id, ac.name, ac.category_id, ac.periode, ac.minutes, ac.sdm, ac.date
       FROM assignments g JOIN activities ac ON ac.id = g.activity_id
       WHERE g.user_id = ?
       ORDER BY ac.category_id, ac.name COLLATE NOCASE`,
    )
    .all(userId) as Array<{
    activity_id: number;
    name: string;
    category_id: string;
    periode: Periode;
    minutes: number;
    sdm: number;
    date: string;
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

  return rows.map((row) => {
    const period = currentPeriod(row.periode, today);
    const due = dueDate(row.periode, period, row.date);
    const log = index.get(`${row.activity_id}|${period.key}`);
    const done = log?.status === "selesai";
    const completedAt = done ? log.completed_at : null;
    const note = notes.get(`${row.activity_id}|${period.key}`);
    return {
      ...row,
      period_key: period.key,
      period_start: period.start,
      period_end: period.end,
      due,
      status: done ? "selesai" : "open",
      completed_at: completedAt,
      late: completedAt ? dbDateToIso(completedAt) > due : false,
      note: note?.note ?? "",
      link: note?.link ?? "",
    };
  });
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
       WHERE l.user_id = ? AND l.status = 'terlewat'
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
      `SELECT ac.periode, ac.date FROM assignments g JOIN activities ac ON ac.id = g.activity_id
       WHERE g.user_id = ? AND g.activity_id = ?`,
    )
    .get(userId, activityId) as { periode: Periode; date: string } | undefined;
  if (!activity) return "invalid";

  const today = todayIso();
  const current = currentPeriod(activity.periode, today);
  const existing = db
    .prepare("SELECT status FROM activity_logs WHERE user_id = ? AND activity_id = ? AND period_key = ?")
    .get(userId, activityId, periodKey) as { status: "selesai" | "terlewat" } | undefined;

  if (periodKey !== current.key && existing?.status !== "terlewat") return "invalid";

  const due = dueDate(activity.periode, periodFromKey(activity.periode, periodKey), activity.date);
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
      `SELECT ac.periode, ac.date FROM assignments g JOIN activities ac ON ac.id = g.activity_id
       WHERE g.user_id = ? AND g.activity_id = ?`,
    )
    .get(userId, activityId) as { periode: Periode; date: string } | undefined;
  if (!activity) return "open";

  const due = dueDate(activity.periode, periodFromKey(activity.periode, periodKey), activity.date);
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
      `SELECT l.status, l.completed_at, l.period_key, ac.periode, ac.date
       FROM activity_logs l JOIN activities ac ON ac.id = l.activity_id
       WHERE l.user_id = ?`,
    )
    .all(userId) as Array<{
    status: "selesai" | "terlewat";
    completed_at: string | null;
    period_key: string;
    periode: Periode;
    date: string;
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
    bump(dueDate(row.periode, period, row.date), "missed");
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

export function listHistory(userId: number, status?: "selesai" | "terlewat"): HistoryRow[] {
  const rows = db
    .prepare(
      `SELECT l.id, l.activity_id, l.period_key, l.status, l.completed_at,
              ac.name, ac.category_id, ac.periode, ac.date
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
    date: string;
  }>;

  const notes = listOccurrenceNotes(userId);

  return rows
    .map((row) => {
      const period = periodFromKey(row.periode, row.period_key);
      const due = dueDate(row.periode, period, row.date);
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

/** Tiga penghitung di dashboard user — dikirim balik oleh action agar DOM-nya sinkron. */
export interface TaskStats {
  /** "Selesai hari ini" sebagai "2/3". */
  doneToday: string;
  /** Kemunculan yang terlewat. */
  missed: number;
  /** Tugas yang selesai bulan ini. */
  doneMonth: number;
}

export function taskStats(userId: number): TaskStats {
  const today = todayIso();
  const todayItems = listUserOccurrences(userId).filter((item) => item.due === today);
  const doneToday = todayItems.filter((item) => item.status === "selesai").length;

  return {
    doneToday: `${doneToday}/${todayItems.length}`,
    missed: listMissedTasks(userId).reduce((sum, item) => sum + item.count, 0),
    doneMonth: countCompletedBetween(userId, `${today.slice(0, 7)}-01`, today),
  };
}

export { db };

export { db as default };