# Compact — project context

Handover notes for this repo: what it is, how it is wired, and the decisions behind the
current code. Read this whenever a task touches unfamiliar ground; update it when a
decision changes.

## What it is

"better-belt" — an assignment tracker for Indonesian government-style work units (satuan
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
`activity_logs`, `occurrence_notes`, `password_reset_requests`.

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

`positions` is the Posisi/Jabatan list behind the dropdown on `/dashboard/users` (unique
label, case-insensitive via `idx_positions_label`). `users.jabatan` stores the label text
itself, not a foreign key: renaming a position updates the matching accounts, deleting one
leaves them with the text they already had. It is not part of the session token.

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

## Mutations go through Astro Actions

`src/actions/index.ts` holds every mutation. Each action re-checks the session itself
(`currentUserId` / `currentAdminId`) — an action runs server-side, so it is its own trust
boundary. Input is validated with zod (`import { z } from "astro/zod"`; `astro:schema` is
deprecated in Astro 7).

Current actions: `completeTask`, `undoTask`, `saveNote`, `assignActivities`,
`assignActivitiesToUsers` (bulk — many activities to many users, existing pairs skipped),
`removeActivity`, `clearAssignments`, `markAssignmentsSeen` (marks the caller's own inbox —
never takes a `userId` from the client), `createUserAccount`, `deleteUserAccount`,
`saveActivity`, `deleteActivities`, `deletePost`, `savePost`, `createDirectAssignment`,
`removeDirectAssignment`.

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

## Notable files

| File | Role |
| --- | --- |
| `src/scripts/motion.ts` | motion kit + toast helpers |
| `src/scripts/toast.ts` | `toast()` — one panel for every short feedback; tone picks icon + colour |
| `src/scripts/dashboard.ts` | re-exports `toast()`, adds `refreshPage()` for admin actions |
| `src/scripts/tasks.ts` | DOM patching for the level-1/2 workspace |
| `src/actions/index.ts` | every mutation |
| `src/lib/notes.ts` | `parseNoteValues`, `parseNote`, `NOTE_MAX`, `linkLabel` |
| `src/lib/activities.ts` | `parseActivityValues` (plain values), `parseActivity` (FormData) |
| `src/lib/db.ts` | schema + queries, `taskStats()`, `undoOccurrence()`, `setOccurrenceNote()` |
| `src/pages/user/penugasan.astro` | level-1 "Penugasan": direct assignments this supervisor gave, plus the dialog |
| `src/pages/instruksi.astro` | admin tracker: every direct assignment the admin gave, with progress |
| `src/components/GivenAssignments.astro` | shared tracker panel (summary counts, `?belum=1` filter, per-assignment cards) |
| `src/components/user/TaskTimeline.astro` | per-period strip: selesai / terlewat / berjalan, ≤12 nodes |
| `src/components/admin/DirectAssignDialog.astro` | the shared "Instruksi" dialog (admin + level 1) |
| `src/components/user/TaskCard.astro` | task row, toggle button, `data-task-toggle` / `data-state` |
| `src/components/user/ContributionGraph.astro` | the yearly heatmap (GitHub-style) on the user page |
| `src/components/user/NoteDialog.astro` | note + link dialog, saves through `saveNote` |
| `src/components/user/TaskNote.astro` | always rendered (hidden when empty) so actions can fill it in |
| `src/layouts/Layout.astro` | `html.js` marker, reveal safety net, `astro:after-swap` theme restore |

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

## Instruksi (direct assignments)

Two entry points, one component:

- **Admin** — an "Instruksi" button on `/dashboard/assignments`, next to the bulk
  dialog. `/dashboard/assignments` remains the only place to touch the whole catalog.
- **Level 1** — `/user/penugasan` (nav item "Instruksi", role 1 only). Deliberately *not*
  the admin page: this one is scoped to what the supervisor handed out themselves. Level 2
  is redirected to `/user`; admin is redirected to `/dashboard/assignments`
  (`requireAssigner` in `src/lib/auth.ts`).

The dialog is the "Tambah Aktivitas" form of `categories/[id].astro` minus the unit
choice: name, start date, deadline, duration, periode, classification, frequency, SDM,
computed volume, then the recipient list grouped by level with the same jabatan badge and
search/highlight as the bulk dialog. The unit is never chosen — it is always
`penugasan-langsung`.

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

- Uncommitted: the whole motion/actions rewrite (see `git status`), the `/user` dashboard
  rework (task list on top, bell opens `InboxDialog`, period filter chips), the
  `start_date`/`end_date` range migration, and the release confirmation dialog.
- Done from the meeting agenda: master Posisi/Jabatan, dynamic kategori, Penugasan Massal,
  Notifikasi Pekerjaan Masuk, Instruksi, plus traceability ("Dari" on the
  recipient side) and the giver's progress tracker with the per-period timeline.
- Still open: Red Notice for overdue work, Konsep Lembur (undecided), "konfirmasi selesai
  oleh pegawai" — today a task is done the moment the employee ticks it, with no approval
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
