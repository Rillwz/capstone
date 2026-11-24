# Compact — project context

Handover notes for this repo: what it is, how it is wired, and the decisions behind the
current code. Read this whenever a task touches unfamiliar ground; update it when a
decision changes.

## What it is

"umsura-assignment" — an assignment tracker for Indonesian government-style work units (satuan
kerja). Two roles of end users plus an admin:

- **Admin (role 0)** — `/dashboard`: manage work units (kategori), activity types
  (jenis aktivitas), assignments (penugasan), users, and announcements (postingan).
- **Level 1 / Level 2** — `/user`: their own task list per period, with per-occurrence
  notes and links, plus `/user/riwayat` (history). Level 1 also gets `/user/penugasan`
  ("Penugasan"), where a supervisor hands out direct assignments; level 2 does not.

Stack: Astro 7 (SSR, `@astrojs/node`), Tailwind v4, `better-sqlite3`, `auth-astro`,
`bcryptjs`, `motion` v14, `marked`. UI copy is Indonesian; code comments are English.

## Commands

```sh
npx astro dev --background      # dev server, http://localhost:4321
npx astro dev status|stop|logs  # manage the background server
npx astro check                 # types, must be run from the repo root
npx astro build
```

## Data

SQLite at `data/app.db` (`src/lib/db.ts` owns the schema and every query).
Tables: `users`, `positions`, `posts`, `login_logs`, `activities`, `assignments`,
`activity_logs`, `occurrence_notes`, `password_reset_requests`, `overtime_requests`,
`overtime_settings`.

`password_reset_requests` is the "Lupa kata sandi" queue. There is no token and no email:
`/lupa-sandi` only records that an account asked; `/dashboard/permintaan-reset` (menu
"Reset") is where the admin resets the hash to `DEFAULT_USER_PASSWORD`
(`status = 'reset'`, with `handled_by` / `handled_at`) or dismisses it (`'rejected'`). One
account holds at most one `pending` row (`createPasswordResetRequest` refuses a second),
and only `pending` rows can be handled, so a stale form cannot reset an account twice. The
request page answers with the same success screen whether or not the email exists, so it
cannot be used to enumerate accounts. The count of pending rows is the badge in
`DashboardLayout`, so every admin page carries the notification.

`DEFAULT_USER_PASSWORD` (`src/lib/defaults.ts`) is the literal `"12345678"`, not an env
read: every new account, every reset, and the seed script get that same password, and
`/dashboard/users` shows it through `PasswordReveal`. Changing it means editing code, on
purpose — an env override would let a deploy change the password of every new account
without a diff.

`occurrence_notes` is separate from `activity_logs` on purpose: a note must survive an
undo, and it may exist on a task that is still open. Notes are keyed by
`(user_id, activity_id, period_key)`.

`overtime_requests` holds "Pengajuan Lembur". One row = one request for one civil date
(`tanggal`, `YYYY-MM-DD`); duration is derived from `jam_mulai`/`jam_selesai` at render
time by `overtimeMinutes()`, never stored. Status is only `pending` / `disetujui` /
`ditolak` — there is **one** approval step (admin), deliberately: adding a second tier
needs a `step` column plus a filter in `handleOvertimeRequest`, not a new system.
`catatan_admin` carries the rejection reason or the approval note. A partial unique index
(`(user_id, tanggal) WHERE status = 'pending'`) stops a double-click from filing two rows;
a decided row frees the date again.

Requests only accept **today**: the form is gated on today's work, so another date has no
basis. No overnight shifts — `jam_selesai` must be later than `jam_mulai`.

`overtime_settings` is a single row (`CHECK (id = 1)`), so no query has to pick "the
latest": `min_minutes` (default 60) is the completed-minutes threshold that unlocks the
form, `expire_minutes` (default 180) the silence limit before auto-reject. Both are edited
on `/dashboard/lembur`.

Auto-reject has no scheduler. `expireOvertimeRequests()` runs at the top of every overtime
read and stamps `handled_at = datetime(created_at, '+<expire> minutes')` — the deadline is
deterministic, so a sweep that runs five hours later reaches the same verdict; only the
write is late. Same shape as `materializeOverdue()`.

The gate is `completedMinutesToday(userId)`: the sum of `activities.minutes` over
`activity_logs` rows completed today (Jakarta), re-checked inside the `submitOvertime`
action — the disabled form is decoration, the action is the fence. Caveat: work finished
before midnight and filed at 00:30 lands in yesterday's bucket and is refused.

The bell is one panel, two sources: unseen assignments plus **every** decided overtime row
(`seen_at IS NULL`), so an approval is announced too, not just a rejection.
`InboxDialog` is titled "Notifikasi" and `markNotificationsSeen` closes both at once.

`positions` is the Posisi/Jabatan list behind the dropdown on `/dashboard/users` (unique
label, case-insensitive via `idx_positions_label`). `users.jabatan` stores the label text
itself, not a foreign key: renaming a position updates the matching accounts, deleting one
leaves them with the text they already had. It is not part of the session token.

## Absensi (geolocation attendance)

One office, one point. `attendance_location` is a singleton (`CHECK (id = 1)`, the same
pattern as `overtime_settings`): label, `latitude`/`longitude`, and `radius_m` (CHECK
10–300). `saveAttendanceLocation` is an upsert on `id = 1`, so there is no add/edit/retire
flow and no `active` flag. `attendance_logs` is one row **per event**, not per day: `kind`
is `masuk` or `pulang`, and each row carries its own coordinates, `accuracy_m`,
server-computed `distance_m`, `location_label`, plus `ip` / `user_agent`. `UNIQUE (user_id,
tanggal, kind)` is the real fence against a double submit — the action inserts with
`INSERT OR IGNORE` and reports `CONFLICT`, it does not pre-check in JS. `tanggal` is the
Jakarta civil date; the time of day is `created_at`.

`location_label` is a **copy** of the office name at the moment of the event, not a foreign
key. Renaming the office never rewrites history, and there is no join to maintain.

`src/lib/attendance.ts` holds the whole decision and no DB: `haversineMeters`,
`circlePolygon`, `distanceFromOffice`, `parseCheckValues`, `parseLocationValues`, and
`judgeAttendance`. The page, the smart preview and the action use the same parser. The
server never accepts a distance from the client — it recomputes from the raw pair.

`judgeAttendance` order matters: no office → `pulang` without `masuk` → already recorded
→ accuracy worse than `min(radius, 150)` → outside the radius. The radius is **not** widened
by the reported accuracy: adding them would let a faker send accuracy 5000 and walk through.

`/user/absensi` asks for the position only when a button is pressed (a permission prompt on
page load is the fastest way to get "Block"). It shows the local distance before sending,
but the server decides again. Without a secure origin (`http://192.168…`) the browser never
returns a fix, so the page checks `window.isSecureContext` and says so instead of hanging.

`/dashboard/absensi` is the **report** and `/dashboard/absensi/lokasi` is the **editor**.
They were split on purpose: the report is driven by GET links (`?mode=…&q=…`), and every
navigation re-mounts MapLibre; keeping the map on the same page meant a half-typed location
form was thrown away each time the admin changed period. The report page does not load
MapLibre at all.

Three modes, all in the URL: `mode=harian|bulanan|tahunan` plus `tanggal` / `bulan` / `tahun`
and `q`. `parseReportPeriod` (in `attendance.ts`, no DB) validates whatever the URL holds and
falls back to today on garbage, so a hand-edited URL can never 500 the page. Only the key that
belongs to the active mode is read or written. `shiftReportPeriod` moves one step in the
mode's own unit — it does its own month and leap-year arithmetic, never `Date` month overflow.

`q` filters **name, email, or jabatan in SQL**, not in the DOM (unlike `/dashboard/users`,
whose list is the whole table). The LIKE pattern is escaped, so a typed `%` stays literal.
The same `q` goes to the recap, the missing list, the summary, and the year grid; every link
on the page carries it, otherwise changing period would silently drop the filter.

Report queries: `listAttendanceRecap(tanggal, q)` and `listAttendanceMissing(tanggal, q)` for
one day; `listAttendanceMissingRange(start, end, q)` and `listAttendanceSummary(start, end, q)`
for a range; `listAttendanceMonthCells(start, end, q)` for the year grid (flat rows, pivoted
in the page). The summary uses `LEFT JOIN` on purpose: an employee with zero rows must appear
with `0`, because that is the case the monthly report exists to show. `days_out > days_in`
cannot happen — the action refuses `pulang` without `masuk` on the same day.

**No percentages.** The app has no working-day calendar, holidays, or leave records, so any
"attendance %" would have an invented denominator. The pages show counted days, and
"hari berjalan" as context only.

The missing list is derived (`users` role ≠ 0 minus the `masuk` rows), not stored. Its nav
badge is `countAttendanceMissing(todayIso())` — daily and unfiltered, whatever the page shows.

### Export CSV

`GET /dashboard/absensi/export?mode=…&tanggal=|bulan=|tahun=&q=…` returns the same data the
page shows, as `text/csv`. It is a plain link in the report's period bar, so it works without
JavaScript, keeps the period and filter, and lands in the download history. `requireAdmin`
guards it — the CSV is admin data like the page is; a level 1/2 request is redirected, never
served.

Columns: daily = one row per employee **including the absentees** (`Status` = `Lengkap` /
`Belum pulang` / `Tidak hadir`), monthly = per-employee totals, yearly = the 12-month grid.
Nol is written `0`, not `·` — the file is meant to be calculated with.

Format decisions, each deliberate:

- **`;` separator + UTF-8 BOM.** That is what Excel in an Indonesian locale needs to open
  straight into columns; a comma CSV would land in one column and accented names would mangle.
  Google Sheets needs the separator set manually on import.
- **`csvCell` prefixed with `'` for cells starting with `=`, `+`, `-`, `@`, tab or CR.** Names
  and jabatan are admin-supplied text, i.e. a trust boundary — without this, Excel executes
  them as formulas. Cells containing `;`, `"`, or a newline are quoted and `"` doubled.
- **No metadata block.** Row 1 is the header, so the file parses and pivots cleanly. Period and
  office are in the filename and the columns.
- Meter values are rounded, clock times are `HH:MM` WIB via `formatClock` (en-GB on purpose:
  `id-ID` writes `13.05`), nullable cells stay empty rather than `NaN`.

`buildAttendanceCsv` in `attendance.ts` is pure — no DB, no clock, no request — so the whole
format is covered by `check-attendance.ts` without an HTTP call. The endpoint only queries,
builds, and sets the headers.

### MapLibre

`src/scripts/attendance-map.ts` is the only place that touches MapLibre. Tiles are
OpenFreeMap styles (no key, no cost) picked from the theme: `liberty` light, `dark` dark,
`positron` paper. The library is loaded with `await import()` so only the pages that draw a
map pay for it (`/user/absensi` and `/dashboard/absensi/lokasi`); the built chunk is ~1.1 MB.

Three gotchas, each already cost a debugging session:

- **`optimizeDeps.exclude: ['maplibre-gl']` in `astro.config.mjs`.** MapLibre v6 loads its
  worker from a real URL beside its own bundle; Vite's pre-bundling rewrites that path into
  `deps/`, the worker 404s, and the map silently stays blank.
- **`map.isStyleLoaded()` before `addSource`.** Drawing the fence circle before the style is
  parsed throws `Style is not done loading`; `drawCircle()` queues itself on `load` instead.
- **`map.remove()` on `astro:before-swap`.** `ClientRouter` keeps modules alive, so a map
  that is not destroyed leaks a WebGL context and the tab dies after a few navigations.

The radius is drawn as a GeoJSON polygon from `circlePolygon`, not as a pixel-radius
circle: pixels lie about metres once you zoom.

`assignments.seen_at` powers the "Pekerjaan masuk" inbox: `NULL` means the holder has not
read it yet. The unit is the assignment, not its occurrences — a daily task must not ring
the bell every day. The migration backfills `seen_at = created_at` for existing rows;
without it every old assignment would show up as unread the day the feature ships.
`idx_assignments_unseen` is a partial index (`WHERE seen_at IS NULL`) because the bell only
ever counts those rows.

`assignments.created_by` + `assignments.origin` record who handed a task over.

- `origin = 'langsung'` — created by the Instruksi dialog. `created_by` is the
  person who gave it, and only they (or the admin) may release it.
- `origin = ''` — assigned from the shared catalog (bulk or per-user). `created_by` is the
  admin who did it, so the recipient still sees "Dari"; these rows are **not** tracked on
  the direct-assignment pages.
- `created_by NULL` — legacy rows from before the feature. The UI shows no "Dari" line at
  all rather than inventing "Sistem". Deliberately left alone; backfilling would be a data
  claim nobody made.

`assignments.created_by` is `ON DELETE SET NULL`, so deleting an account keeps the
assignment and just drops the attribution.

A task whose `start_date` is in the future has no occurrence at all (`activePeriod` returns
`null`), so the recipient's dashboard would show nothing until the day arrives. `listUpcomingAssignments`
feeds a separate "Akan datang" section on `/user` (no checkbox — the period does not exist yet)
so an instruction the admin just gave never looks lost. It is a plain read, not part of
`taskStats`; the counter in the bell comes from `seen_at` and is unaffected.

`assignments.archived_at` is the archive marker (`NULL` = active). Archiving is a soft
delete: the row, its `occurrence_notes` and its `activity_logs` stay, but the assignment
disappears from the holder's dashboard, the inbox bell, the Instruksi tracker, the missed
panel and every coverage count. Restoring clears `archived_at`, resets `seen_at` and
restarts `created_at` — periods are counted from the assignment date, so keeping the old
date would revive the archived stretch as a pile of missed periods. Assigning the same
activity again through the catalog revives the row instead of skipping it
(`ON CONFLICT ... DO UPDATE ... WHERE archived_at IS NOT NULL`). "Hapus semua" only
deletes active rows; permanent deletion is a separate action from the archive tab.
`listHistory` and the contribution graph deliberately ignore the flag: what already
happened stays on the record.

Authorization for releasing a direct assignment is `created_by`-scoped: a level-1
supervisor can only undo their own, never the admin's.

`categories` holds one system unit, `penugasan-langsung` ("Instruksi", icon
`zap`), seeded idempotently at startup. Every direct assignment's activity lives there,
so the catalog stays clean and the origin is easy to trace. `deleteCategory` returns
`false` for it: `activities.category_id` has no foreign key, so deleting the unit would
orphan its activities instead of removing them. The categories page hides it from the
delete list and shows a "Unit sistem" badge.

`data/app.db` holds the owner's real data (users `admin@assignment.id` line 1, `dosen1@…`,
`dosen2@…`, and the 12 MPP activities). Never wipe it; if a test script touches it, restore
the rows afterwards.

Two tables are empty, and both are leftovers rather than live data: the pre-import backup
(`app.db.pre-mpp`, 21 Oct) had 8 `activity_logs` + 2 `occurrence_notes` pointing at activity
ids 50–53, which no longer exist — the seed activities were replaced by the MPP import under
new ids, and both tables cascade on `activity_id`. Its 2 `posts` were throwaway rows ("1",
"2"). No test script in the scratch dir deletes them without a `user_id` / `author_id`
filter, so this was not the test suite; the exact cause was not established. Do not "restore"
either table from the old backup — the ids no longer line up.

### The MPP import (Matriks Rencana Kerja)

`MPP.xlsx` (repo root, gitignored) is the source spreadsheet: 11 sheets = the 11 work
units, 206 activity rows. It is imported with two steps:

```sh
python3 .opencode/skills/mpp-import/scripts/mpp.py extract MPP.xlsx data/mpp.json
bun run src/scripts/import-mpp.ts
```

The skill `mpp-import` (`.opencode/skills/mpp-import/`) wraps the whole flow and is the
shortcut to use: it audits the file first (`mpp.py audit`), so the app's period
vocabulary and validation limits are ready before anything is written, then verifies the
result (`mpp.py verify`). The extractor maps the columns **by header name** (some sheets
have no "tanggal" column, so the columns shift), turns the free-text dates into a day
number (empty → 0 = no date), and maps the period vocabulary onto the app's labels. MPP
carries no date range, so imported rows get an empty `start_date`/`end_date` — valid from
the assignment onward, repeating without limit, exactly as before the range existed.
`import-mpp.ts` runs every row through the app's own `parseActivityValues` and upserts it
in one transaction (same category + name → update, so an import can be repeated after the
file is fixed).

Values follow the file, so the app's limits were widened to fit it: name ≤ 500
characters, frequency ≤ 9999, minutes ≤ 9999, and a row may carry **no** classification
(the file has 26 such rows). The period vocabulary grew with it: `Harian`, `Mingguan`,
`Bulanan`, `Triwulan`, `Semesteran`, `Tahunan`, `Kegiatan` — the DB's CHECK constraint
was migrated by rebuilding the table (foreign keys off while swapping, so assignments and
logs survive). "Kegiatan" keeps its own label but takes a monthly slot, because it is an
event, not a calendar period.

## Motion

`src/scripts/motion.ts` is the single source of timing vocabulary: `reveal`, `countUp`,
`countTo`, `pressFeedback`, `hoverLift`, `dialogMotion`, `scrollProgress`.

- The pre-animation hidden state lives in CSS (`html.js [data-reveal] { opacity: 0 }`),
  gated on `prefers-reduced-motion: no-preference`. The `js` class is set by the inline
  head script in `Layout.astro`.
- `<ClientRouter />` is enabled. The root cross-fade is disabled in `global.css`
  (`::view-transition-old/new(root) { animation: none }`) because a root snapshot paints
  over the live DOM and hides the entrance cascade — **the entrance animation is the page
  transition**.
- The entrance replays on link navigations only. Form actions, back/forward
  ("traverse") and action-driven re-renders (`navigate(url, { info: { instant: true } })`)
  show the page instantly. `motion.ts` decides this in its `astro:before-preparation`
  listener (`formData`, `navigationType`, `info.instant`).
- Astro does not re-run module scripts on navigation: every script-bearing file uses
  `document.addEventListener("astro:page-load", init)` plus an idempotent `init()`.
  `astro:after-swap` restores the theme and the `js` class, because the router replaces
  `<html>` attributes.

## Docked menu rail

The lg+ sidebar (`DashboardLayout`) collapses to a 72px icon rail from
`DockToggle.astro`. The state is a single attribute, `data-dock-mini` on `<html>`, so
CSS owns the transition (`[data-dock]` rules in `global.css`) and JS only flips it
(`src/scripts/dock.ts`, key `assignment-dock`). Three things keep it from flickering:

- the inline head script in `Layout.astro` sets the attribute before first paint;
- `astro:after-swap` puts it back, because the router replaces `<html>` attributes;
- the mini rules are scoped to `[data-dock]`, so the mobile drawer (same `SidebarNav`
  markup) keeps its labels.

In the rail each link keeps a `data-label` that CSS renders as a tooltip on hover/focus;
the link's `aria-label` carries the same name, so the tooltip is decoration only.

## Mutations go through Astro Actions

`src/actions/index.ts` holds every mutation. Each action re-checks the session itself
(`currentUserId` / `currentAdminId`) — an action runs server-side, so it is its own trust
boundary. Input is validated with zod (`import { z } from "astro/zod"`; `astro:schema` is
deprecated in Astro 7).

Current actions: `completeTask`, `undoTask`, `saveNote`, `assignActivities`,
`assignActivitiesToUsers` (bulk — many activities to many users, existing pairs skipped),
`removeActivity`, `clearAssignments`, `archiveAssignment`, `restoreAssignment`,
`markNotificationsSeen` (marks the caller's own bell — never takes a `userId` from the
client), `createUserAccount`, `deleteUserAccount`, `saveActivity`, `deleteActivities`,
`deletePost`, `savePost`, `createDirectAssignment`, `removeDirectAssignment`,
`submitOvertime`, `cancelOvertime`, `decideOvertime`, `saveOvertimeSettings`,
`checkAttendance`, `saveAttendanceLocation`.

The attendance pair is split the same way: `checkAttendance` is `currentUserId` and refuses
role 0 (admins do not clock in); `saveAttendanceLocation` is `currentAdminId` and upserts the
single point. There is deliberately **no** action that deletes an attendance row — history
that can be erased is not history.

The overtime quad is split by trust: `submitOvertime` / `cancelOvertime` are
`currentUserId` (a user files and withdraws only their own pending row, and the submit
re-checks the minutes gate), `decideOvertime` / `saveOvertimeSettings` are
`currentAdminId`.

The direct-assignment pair is guarded by `currentAssigner` (role 0 **or** 1, else 403), not
`currentAdminId`. Targets are re-filtered server-side to `role !== 0`; the dialog's list is
only a convenience. `createDirectAssignment` runs activity + assignments in one
transaction, and reuses an existing activity of the same `name COLLATE NOCASE` + `periode`
inside `penugasan-langsung` (`created: false`) instead of duplicating the master row.
`removeDirectAssignment` deletes only rows whose `created_by` is the caller.

`completeTask` and `undoTask` also answer with `graph`: the daily buckets of the
year the client passes as the optional `year` input, so the contribution graph can
be patched in place. See "Contributions heatmap" below.

Two shapes are in use:

- **In place** (`/user`): the action returns the new state (`taskStats`), the client
  patches the DOM through `src/scripts/tasks.ts` (`setTaskState`, `applyStats`,
  `refreshGroupCounts`, `setTaskNote`). No router navigation, no scroll jump.
- **Re-render** (admin area): the action mutates, then the client calls
  `refreshPage()` (`src/scripts/dashboard.ts`) — a router navigation to the same URL, so
  the DOM is replaced with fresh server-rendered data but the browser never reloads.
  `refreshPage()` restores the scroll afterwards, because the router always scrolls to
  top on a non-traverse navigation. Feedback is a client-side toast, not a URL parameter.

Forms may still exist as *field containers* (native validation, `required`), but their
submit is always intercepted and handled by an action. The admin area is JS-only — that
is already true of the dialogs, search and drag-and-drop.

## Notifications (toast)

Every short-lived feedback is one toast (`src/scripts/toast.ts`), rendered into
`#toast-region` from `ToastRegion.astro` (mounted once in `DashboardLayout`). The tone
picks the icon and the colour: `success` (emerald, `CheckCircle`), `error` (red,
`XCircle`, assertive `role="alert"`), `warning` (amber, `ExclamationTriangle`), `info`
(brand, `InformationCircle`). Success and info leave after 4s, warning and error after 6s.
The icons live as `<template data-toast-icon="…">` in the region so `toast.ts` clones
them — no raw SVG in JS, and `src/lib/icons.ts` stays the one icon door.

This is *not* the "Pekerjaan masuk" bell or the reset-request badge: those are persistent
counts in the header, never toasts.

Two sources, one panel:

- **After an action** — the page script calls `toast(message, tone?)`. `dashboard.ts`
  re-exports it, so every existing call site is unchanged. The region is `fixed` at the
  bottom, so showing a toast never pushes the table below it around.
- **After a redirect** — the page renders `ToastFlash` (`?saved=1`), an invisible
  `[data-toast-flash]` marker plus a `<noscript>` banner. `toast.ts` drains it on
  `astro:page-load`, drops the URL parameter (so a refresh cannot repeat it) and shows the
  toast. Because the layout imports the module, pages without their own script still work.

`toast()` returns a handle `{ el, dismiss }`. The 5 second undo window on
`/dashboard/users` is the only caller that uses it: the toast carries a `Batalkan` action
and a `.toast-countdown` bar whose `animationDuration` is set from the same `duration`, so
the visual and the timer cannot drift. Passing `action` also adds the bar.

`shortcut:` a toast is below the top layer, so validation errors inside a `<dialog>` still
use the in-dialog error box, not a toast. One pending delete at a time — a queue is only
needed if batch deletes arrive.

## Contributions heatmap

The user page shows a GitHub-style year grid (`ContributionGraph.astro`): one column per
week, one row per weekday (Mon–Sun). A cell is green by how many tasks were **completed
that day** (the completion day, like a commit) and carries a red ring when a period was
**missed** (on its due date, not on the day the app noticed). The range is the calendar
year, chosen with `?tahun=YYYY`; the year picker lists the years that hold data.

The green scale and the missed red live in CSS variables (`--color-graph-0…4`,
`--color-graph-missed`) remapped per theme in `global.css`, so the graph follows
light | dark | paper without any markup change. The grid is plain CSS grid
(`grid-auto-flow: column`) — its track sizes come from `--cell` / `--gap`, so a
mistyped `var()` in the inline style silently collapses the whole grid (check the
computed `grid-auto-columns` if the cells vanish).

The graph is server-rendered, so it has to be patched after every task action:
each cell carries `data-date`, and the section carries `data-graph` /
`data-graph-year`. `completeTask` and `undoTask` take an optional `year` and
answer with `graph` — the daily buckets (`{done, missed}` per date) for that
year only — and `patchGraph` in `src/scripts/tasks.ts` rewrites the cells, the
tooltip and the summary from it. Both actions call `materializeOverdue()`
first, so the numbers equal what a reload would show (an undone late task
reappears as a missed period, and its red ring comes back).

## Dashboards

Both overviews answer "what needs doing now" first and keep vanity numbers out of the
header. They share `src/components/ui/StatCard.astro` (optional `href` makes the whole card
a link; `meter` fills a progress bar) and `src/components/ui/BarChart.astro` (pure CSS,
7 bars for logins on the admin side, 14 for completions on the user side).

**`/user`** — the top strip is today only: how many tasks are still open and the estimated
minutes left (`formatMinutes`). It deliberately does **not** repeat the done ratio, because
the "Hari ini" group header prints it one screen below. The strip is patched live by
`refreshTodaySummary()` (called from `refreshGroupCounts`), which recomputes from the
`data-due-today` cards and flips `data-open` — colour and icon follow that one attribute
through scoped CSS, so no icon markup is built in JavaScript. Missed periods are one
divided card (a chip per period), not a wall of red cards. "Ritme 14 hari" holds the
completion chart plus average, active days and missed; the numbers come from
`dailyDoneTrend(userId, 14)` and are a **load-time snapshot** (a toggle patches the summary
and group counters, not this history) — patch it client-side if that ever feels stale.

**`/dashboard`** — opens with a "Perlu perhatian" strip, then four linked stat cards
(`href` + `meter`), coverage per unit (`listCategoryCoverage`, which skips the
`penugasan-langsung` system unit), the 7-day login `BarChart` (`loginTrend`, bucketed by
Jakarta day in JS) and the latest logins/posts.

## Notable files

| File | Role |
| --- | --- |
| `src/scripts/motion.ts` | motion kit + toast helpers |
| `src/scripts/toast.ts` | `toast()` — one panel for every short feedback; tone picks icon + colour |
| `src/scripts/dashboard.ts` | re-exports `toast()`, adds `refreshPage()` for admin actions |
| `src/scripts/tasks.ts` | DOM patching for the level-1/2 workspace (`setTaskState`, `applyStats`, `refreshTodaySummary`) |
| `src/lib/format.ts` | `formatDate` (returns "–" on bad input), `formatMinutes`, `graphCellTitle` |
| `src/components/ui/BarChart.astro` | shared pure-CSS bar chart (admin logins, user rhythm) |
| `src/components/ui/StatCard.astro` | stat card; `href` links the whole card, `meter` fills a bar |
| `src/actions/index.ts` | every mutation |
| `src/lib/notes.ts` | `parseNoteValues`, `parseNote`, `NOTE_MAX`, `linkLabel` |
| `src/lib/activities.ts` | `parseActivityValues` (plain values), `parseActivity` (FormData) |
| `src/lib/overtime.ts` | `parseOvertimeValues`, `overtimeMinutes`, `OVERTIME_NOTE_MAX` |
| `src/pages/user/lembur.astro` | employee side: gate panel, request form, own history |
| `src/pages/dashboard/lembur.astro` | admin side: settings card, queue, decided rows |
| `src/components/ui/OvertimeStatus.astro` | status chip (pending / disetujui / ditolak) |
| `src/lib/db.ts` | schema + queries, `taskStats()`, `undoOccurrence()`, `setOccurrenceNote()` |
| `src/pages/dashboard/assignments.astro` | per-user assignments (catalog + bulk dialogs) and the `?arsip=1` archive tab |
| `src/pages/user/penugasan.astro` | level-1 "Penugasan": direct assignments this supervisor gave, plus the dialog |
| `src/pages/instruksi.astro` | admin "Instruksi": gives direct assignments (dialog lives here) and tracks their progress |
| `src/components/GivenAssignments.astro` | shared tracker panel (summary counts, `?belum=1` filter, per-assignment cards) |
| `src/components/user/TaskTimeline.astro` | per-period strip: selesai / terlewat / berjalan, ≤12 nodes |
| `src/components/admin/DirectAssignDialog.astro` | the shared "Instruksi" dialog (admin + level 1); "1. Aktivitas" is one horizontal row of 11 columns, `min-w-[56rem]` inside `overflow-x-auto` so it stays one row on a phone |
| `src/components/user/TaskCard.astro` | task row, toggle button, `data-task-toggle` / `data-state` |
| `src/components/user/ContributionGraph.astro` | the yearly heatmap (GitHub-style) on the user page |
| `src/components/user/NoteDialog.astro` | note + link dialog, saves through `saveNote` |
| `src/components/user/TaskNote.astro` | always rendered (hidden when empty) so actions can fill it in |
| `src/layouts/Layout.astro` | `html.js` marker, reveal safety net, `astro:after-swap` theme restore |
| `src/components/admin/DockToggle.astro` | lg+ rail toggle for the docked menu |
| `src/scripts/dock.ts` | rail state (`data-dock-mini`, `assignment-dock`) |
| `src/lib/attendance.ts` | haversine, radius polygon, parsers, `judgeAttendance` |
| `src/scripts/attendance-map.ts` | the only MapLibre door: mount, fences, `destroy()` |
| `src/pages/user/absensi.astro` | employee: masuk/pulang, own history, map |
| `src/pages/dashboard/absensi.astro` | admin report: daily/monthly/yearly + `q` filter |
| `src/pages/dashboard/absensi/lokasi.astro` | admin editor: the single office point + map |
| `src/pages/dashboard/absensi/export.ts` | CSV export route, mirrors the page's period + `q` |

## Conventions and gotchas

- **Comments are English**, UI copy is Indonesian. One line, explain the *why*.
- Tailwind v4: `@apply` inside a component `<style>` block fails ("Cannot apply unknown
  utility class") — write plain CSS with `var(--color-*)` tokens instead.
- Zod v4: `z.string().email()` is deprecated → use `z.email()`.
- Links are validated twice: client-side (`parseNoteValues`, no request on bad input) and
  server-side (trust boundary). Only absolute `http`/`https` URLs are allowed.
- Notes are keyed per *occurrence* (`activity_id` + `period_key`), so the same activity
  can be noted in different periods.
- `astro check` and `astro build` must run from the repo root.

## Testing

`bun run src/scripts/check-tasks.ts` is the engine self-check (period keys, due dates,
past periods, date ranges) — run it after touching `src/lib/tasks.ts`; it exits non-zero on
failure.

`bun run src/scripts/check-attendance.ts` checks the attendance maths, the fence, the
report-period parser, and the whole CSV format (haversine, circle polygon, parser edges,
radius/accuracy decisions, mode fallbacks, month/leap-year stepping, cell escaping, formula
injection, BOM, and the shape of each mode's file) with no DB at all.

`bun run src/scripts/check-attendance-db.ts` covers the queries (upsert keeps one row, unique
index, state, recap, missing list, the copied `location_label`, the `q` filter with LIKE
escaping, the range summary including zero-day employees, and the year grid). It **writes to
`data/app.db`** and the office is a singleton, so it namespaces every row `uji-absensi-…`, and
restores the previous office point in a `finally`.

The Playwright script for Absensi is `absensi-e2e.mjs` in
`/private/var/folders/2x/7ht7gfv50yn3m_x0nw392mkc0000gn/T/opencode/absensi-check/` (it runs
`node`, and shells into `bun -e` for fixtures). `context.setGeolocation` plus
`grantPermissions(["geolocation"])` is the only way to test inside/outside radius without
walking to the office. It covers masuk, a refused pulang from outside, a recorded pulang,
both maps rendering, the report page not loading a map at all, the filter (including the
no-match state and that it survives a mode change), the monthly and yearly tables, saving the
single office point from its own route (and that a second save still leaves one row), the
small-radius warning, the level-2 route guard **and** the action guard, and no horizontal
overflow at 390px. `absensi-decimal.mjs` guards the decimal-coordinate regression on
`/dashboard/absensi/lokasi`. `absensi-export.mjs` fetches all three export URLs and checks the
status, headers, BOM **on the raw bytes** (`response.text()` strips it during decode), the
column count, the filtered file, the garbage-URL fallback, that the page link carries the
current period and `q`, and that a level-2 account is redirected instead of served a CSV.

Playwright scripts live outside the repo in
`/private/var/folders/2x/7ht7gfv50yn3m_x0nw392mkc0000gn/T/opencode/`
(`motion-check.mjs`, `actions-check.mjs`, `router-check.mjs`, `admin-router.mjs`,
`admin-actions.mjs`, `entrance-check.mjs`, `riwayat-check.mjs`). Playwright is installed
there, not in the repo; launch with `chromium.launch({ channel: "chrome" })`.

They need throwaway users in `data/app.db` — create them, and delete them (and everything
they own) afterwards. A `window.__probe = 1` marker detects full reloads: a router
navigation keeps it, a reload wipes it.

**Test scripts must only touch their own data.** They run against the owner's database, so
target the rows the script created (match by name/title), never "the first row".

`direct-check.mjs` covers Instruksi end to end (dialog, reuse, `created_by`
scoping, the `penugasan-langsung` delete guard, the level-1 page and its 403s, mobile and
themes). It logs in as the real admin (`admin@assignment.id` / `password123`) and creates
`uji-%` accounts for the rest; it cleans both up, including any direct activities.

`instruksi-row.mjs` guards the horizontal "1. Aktivitas" strip: 11 cells, every control on
one baseline at 1440px **and** at 390px, column order, nothing spilling out of its cell, no
page-level overflow, the strip scrolling inside its own box on a phone, and volume
recomputing. `instruksi-submit.mjs` then submits the reshaped form for real and asserts the
`<select>` periode and the three checkboxes reached the action (`utama` defaults off), and
`instruksi-penugasan.mjs` checks the same row on `/user/penugasan`, the component's second
consumer. All three clean up their own rows.

`given-check.mjs` covers the tracker: admin and level-1 pages, the giver line on the
recipient side, progress flipping to selesai after a completed period, backdated
`created_at` producing missed nodes and the "Terlambat" badge plus overdue-first sorting,
the `?belum=1` filter, bulk rows staying out of the tracker, no-JS release, and mobile at
390px. `bulk-attr-check.mjs` proves catalog assignments record `created_by` while keeping
`origin = ''`. `timeline-check.mjs` builds a 40-day daily task to exercise the 12-node cap,
the "+N periode sebelumnya" label and the strip's width at 390px. `range-check.mjs` covers
the date range and the release confirmation: both forms' fields, `end_date < start_date`
rejection, the deadline stopping recurrence, the release dialog's cancel/Esc/confirm paths,
and a real no-JS release.

`arsip-e2e.mjs` covers the assignment archive end to end: archive hides the task from the
recipient's dashboard and bell without deleting the row, the `?arsip=1` tab reveals it,
restore reactivates the row with a fresh `created_at`, permanent delete needs two clicks,
"Hapus semua" leaves archived rows alone, and the page does not overflow at 390px. It
creates `uji-arsip-*` accounts and removes them again (use a separate browser context for
the employee — pages in one context share the session cookie).

## Instruksi (direct assignments)

Two entry points, one component:

- **Admin** — `/instruksi` (nav item "Instruksi") holds both the dialog and the tracker.
  `/dashboard/assignments` remains the only place to touch the whole catalog, and no longer
  carries the dialog.
- **Level 1** — `/user/penugasan` (nav item "Instruksi", role 1 only). Deliberately *not*
  the admin page: this one is scoped to what the supervisor handed out themselves. Level 2
  is redirected to `/user`; admin is redirected to `/dashboard/assignments`
  (`requireAssigner` in `src/lib/auth.ts`).

The dialog is the "Tambah Aktivitas" form of `categories/[id].astro` minus the unit
choice: name, start date, deadline, duration, periode, classification, frequency, SDM,
computed volume, then the recipient list grouped by level with the same jabatan badge and
search/highlight as the bulk dialog. The unit is never chosen — it is always
`penugasan-langsung`.

"1. Aktivitas" is **one horizontal row**, in the MPP column order: Jenis Aktivitas, Mulai,
Tenggat, Utama, Periodik, Bukan Tupoksi, Periode, Frekuensi/Tahun, Durasi (Menit), Jumlah
SDM, Volume Kerja. Three consequences worth knowing before editing it:

- Klasifikasi and Periode are no longer `ChoiceGroup` chips (seven chips and a 3-chip group
  cannot fit a narrow column). Periode is a `<select>`, classification is three checkboxes
  rendered from `CLASSIFICATIONS` — the field names stay `utama`/`periodik`/`bukan_tupoksi`,
  so the submit payload is unchanged.
- The grid uses `minmax(0, …fr)` columns plus `min-w-0` on each cell. Drop either and the
  `w-full` inputs get an intrinsic width and the row overflows.
- The strip is `min-w-[56rem]` inside an `overflow-x-auto` wrapper, so it is always one row
  and the date fields stay legible; below ~896px the strip scrolls inside its own box. The
  dialog itself is `max-w-6xl`. Labels sit above each control and may wrap to two lines —
  `items-end` keeps the controls on one baseline despite that.

`shortcut:` matching for reuse ignores the date range, so two jobs with the same name and
periode are one definition. Match `start_date`/`end_date` too if per-date variants are ever
needed.

Accepted risk: there is no supervisor hierarchy table, so a level 1 can assign to *any*
level 1 or 2 — including other level 1s. Tighten when the org structure lands.

## Traceability and progress

**Who gave it.** `listUserOccurrences` and `listNewAssignments` `LEFT JOIN users` on
`assignments.created_by` and return `giver_name` / `giver_email`; `TaskCard` renders them as
a "Dari Nama · email" line and the "Pekerjaan masuk" rows repeat it. `LEFT JOIN` is load
bearing: legacy rows have `created_by NULL` and must render *nothing*, which is why the
template guards on `giverName` instead of falling back to "Sistem".

**Did they do it.** `/instruksi` (admin) and `/user/penugasan` (level 1)
render the same `GivenAssignments` component over `listGivenAssignments(createdBy, onlyUnfinished)`.

That function computes each assignment's periods the same way the recipient's dashboard does
— `pastPeriods(periode, max(created_at, start_date), currentPeriod(...), end_date)` plus the
last period — instead of `SELECT count(*) FROM activity_logs`. When `end_date` has passed,
the "last period" is the one containing it, not today's; that row then reads as `selesai` or
`terlambat` and stops moving.

That is deliberate: `materializeOverdue()` only runs when the *recipient* opens their
dashboard, so a counter driven by log rows would report "nothing is late" for an employee
who never logs in. Per period the state is:

| state | when |
| --- | --- |
| `selesai` | a `status = 'selesai'` log exists for that period |
| `terlewat` | a `status = 'terlewat'` log, or a past period with no log at all |
| `berjalan` | the current period, not completed yet |
| `belum` | `start_date` is in the future — no periods exist yet |

Row status rolls those up: not started → "Belum mulai", any `terlewat` → "Terlambat", else
any `berjalan` → "Berjalan", else "Selesai". Rows with a missed period sort first, then
newest first.

`TaskTimeline` draws the last 12 periods (oldest → newest) as a strip: filled brand circle
with a check, red circle with an X, or an empty bordered circle for the current period. Two
details carry the layout:

- The **connecting line** flex-grows, not the nodes. Twelve fixed 14px nodes plus elastic
  lines always fit a 390px column; the other way round the strip overflows. It was measured
  at 316px inside a 316px container.
- Each node has a `title` **and** an `.sr-only` label ("Okt 2026 · selesai · 25 Okt 2026"),
  because state is otherwise colour + shape only.

Periods beyond the 12th are reported as "· +N periode sebelumnya". `shortcut:` older periods
are not expandable; add a detail view if the history ever has to be audited period by period.
`pastPeriods` itself caps at `MAX_PERIODS` (400), so a task older than that silently loses
its oldest history.

Releasing a direct assignment is a plain `POST` to the page itself (`action=remove`), so it
works without JavaScript, and the handler passes `createdBy` to `deleteDirectAssignment` —
which returns `false` for someone else's row, surfacing "bukan milik Anda". With JavaScript
the submit is intercepted and a confirmation dialog names the activity and the recipient
first: releasing also deletes the recipient's completion logs, and it is not undoable. The
dialog posts through `removeDirectAssignment` and shows an error in place if the server
refuses.

The filter is `?belum=1` (a URL, not client state) so it survives reload and can be
bookmarked; `aria-current` marks the active tab.

## Date range (start / end)

`activities` used to carry one `date` whose only meaningful part was the day of the month.
It is now `start_date` + `end_date` (both `''` = open). Migration rebuilds the table and
copies `date` into `start_date`; `end_date` starts empty, so every existing row means the
same thing it did before — the day still anchors the monthly due date.

- `start_date` in the future → the task is not born yet: it is missing from the recipient's
  dashboard and the tracker says "Belum mulai".
- `end_date` **stops recurrence**, it is not a late marker. Periods that would start after
  it never come into existence, so a finished job stops piling up new "terlewat" periods.
  The one period that contains the deadline is still created and, once past, reported as
  missed — it happened, so it stays in the record.
- `dueDate(periode, period, startDate, endDate)` caps the due date at `end_date`;
  `pastPeriods(..., endDate)` stops walking; `activePeriod(...)` returns `null` outside the
  range. The walk starts from `max(created_at, start_date)`, so a late start cannot
  manufacture backlog the supervisor never gave.
- Monthly/Kegiatan still anchor on the day-of-month of `start_date`, so a row whose old
  `date` was the 5th keeps being due on the 5th.
- Validation: dates must be real ISO dates, and `end_date` may not precede `start_date`.

## Current state

- Uncommitted: the rename to Umsura Assignment, the motion/actions rewrite (see `git
  status`), both dashboard reworks (see "Dashboards"), the `start_date`/`end_date` range
  migration, and the release confirmation dialog.
- The local DB was rebuilt after the dashboard review: the pre-demo snapshot was restored
  (real users + original admin password), the 11 default units were re-inserted, and
  `import-mpp.ts` replayed `data/mpp.json`. Result: 12 work units + the `Instruksi` system
  unit, 204 distinct MPP activities. Screenshots for the review used throwaway
  `demo.test` accounts that are now gone.
- Done from the meeting agenda: master Posisi/Jabatan, dynamic kategori, Penugasan Massal,
  Notifikasi Pekerjaan Masuk, Instruksi, plus traceability ("Dari" on the
  recipient side) and the giver's progress tracker with the per-period timeline.
- Assignment archive (`assignments.archived_at`) shipped with the `?arsip=1` tab on
  `/dashboard/assignments`; permanent delete lives only in that tab.
- Lembur shipped as admin-approved requests (`/user/lembur` + `/dashboard/lembur`), gated
  on today's completed minutes, with a 3-hour auto-reject and the decision announced
  through the bell. Multi-tier approval and overtime recap/export are deliberately not
  built yet.
- Absensi shipped: `/user/absensi` (masuk/pulang from the office geofence) and the admin side
  split in two — `/dashboard/absensi` is the report (harian/bulanan/tahunan, filter by name,
  email, or jabatan, "belum absen" list, nav badge, CSV export) and `/dashboard/absensi/lokasi`
  is the MapLibre point editor. The nav item stays "Absensi", so it lights up for both.
  **One office point only** — the table is a singleton, so there is no add-location flow and
  no `active` flag; the editor is a single form that upserts it. Radius 10–300 m; distance and
  the accuracy gate are decided server-side. Each log copies the office name at the time of the
  event.
  Export is CSV only (`;` separated, UTF-8 BOM, formula-injection guarded); XLSX/PDF and an
  employee-side export are deliberately not built.
  Deliberately not built: lateness/working hours, shifts, selfie or QR proof,
  attendance percentages (no working-day calendar), per-user location assignment, multiple
  offices, and any action that deletes an attendance row.
- Still open: Red Notice for overdue work, "konfirmasi selesai oleh pegawai" — today a
  task is done the moment the employee ticks it, with no approval
  step.
- Known follow-up: the Riwayat page's plain-form "Batalkan" button still causes a router
  re-render that jumps the scroll to the top — it can become an action like the rest.

## Hosting

The app is **not** a static site: `output: 'server'` + `@astrojs/node` standalone, a
`sessions` cookie, and a SQLite file on disk (`data/app.db`). Three consequences:

- It needs a long-running Node process. Netlify/Vercel static hosting, GitHub Pages and
  Cloudflare Pages will not run it.
- `data/` must be a **persistent volume**. Serverless filesystems are wiped between
  requests, so the database would silently reset.
- One process only. SQLite + WAL tolerates readers, but two app instances writing the same
  file will fight; scale up, not out.

```sh
npm run build
PORT=3000 HOST=0.0.0.0 npm start   # node ./dist/server/entry.mjs
```

`AUTH_SECRET` must be set in the environment (see `.env.example`; generate with
`openssl rand -hex 32`). `trustHost: true` is already on, so a tunnel or reverse proxy does
not need extra auth config.

### Quick public URL (tunnel)

`cloudflared` is already installed on this machine; `ngrok` is not.

```sh
npm run build && PORT=4399 npm start      # terminal 1
cloudflared tunnel --url http://127.0.0.1:4399   # terminal 2, prints an https URL
```

Any tunnel works (`ngrok http 4399` is equivalent, but needs a free account and authtoken
first). Verified end to end through a Cloudflare quick tunnel: login, admin tracker, level-1
page, stylesheet, session surviving a reload. The URL is random and dies with the process —
fine for a demo, not for anything that must stay up.

Note: the session cookie came back `secure=false` over HTTPS because the tunnel terminates
TLS before the app sees the request. Browsers still store it (the origin is https), and the
session survived a reload. Do not rely on `Secure` being set unless the app itself serves
HTTPS or you add `useSecureCookies` to the auth config.

### Deploying for real

Anything that runs a container with a volume works: Railway, Render (paid disk), Fly.io
(volume), a VPS with systemd + nginx/Caddy. Build with `npm run build`, start with
`npm start`, mount the volume at `/app/data`, set `AUTH_SECRET`. For a VPS, the same
`cloudflared` binary can run as a *named* tunnel with a stable hostname instead of the
throwaway quick tunnel.

`better-sqlite3` is a native module: the image must be built for the same platform as it
runs on (no cross-arch copying of `node_modules`).
