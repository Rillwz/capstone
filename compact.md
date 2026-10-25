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
`activity_logs`, `occurrence_notes`.

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

`assignments.created_by` + `assignments.origin` record who handed out a **Penugasan
Langsung** (`origin = 'langsung'`, `created_by` = that user). Rows from the catalog keep
`created_by NULL` and `origin ''` — they are "given by the system". Authorization for
releasing one is `created_by`-scoped: a level-1 supervisor can only undo their own, never
the admin's.

`categories` holds one system unit, `penugasan-langsung` ("Penugasan Langsung", icon
`zap`), seeded idempotently at startup. Every direct assignment's activity lives there,
so the catalog stays clean and the origin is easy to trace. `deleteCategory` returns
`false` for it: `activities.category_id` has no foreign key, so deleting the unit would
orphan its activities instead of removing them. The categories page hides it from the
delete list and shows a "Unit sistem" badge.

`data/app.db` holds the owner's real data (users `admin@assignment.id` line 1, `dosen1@…`,
`dosen2@…`, 5 demo activities in tata-usaha with 5 assignments, 2 notes and 5 logs for
`dosen1`, posts "1" and "2"). Never wipe it; if a test script touches it, restore the rows
afterwards.

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
number (empty → 0 = no date), and maps the period vocabulary onto the app's labels.
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
`countTo`, `pressFeedback`, `hoverLift`, `dialogMotion`, `scrollProgress`, plus the
`showToast` / `hideToast` helpers.

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
| `src/scripts/dashboard.ts` | `toast()`, `refreshPage()` for admin actions |
| `src/scripts/tasks.ts` | DOM patching for the level-1/2 workspace |
| `src/actions/index.ts` | every mutation |
| `src/lib/notes.ts` | `parseNoteValues`, `parseNote`, `NOTE_MAX`, `linkLabel` |
| `src/lib/activities.ts` | `parseActivityValues` (plain values), `parseActivity` (FormData) |
| `src/lib/db.ts` | schema + queries, `taskStats()`, `undoOccurrence()`, `setOccurrenceNote()` |
| `src/pages/user/penugasan.astro` | level-1 "Penugasan": direct assignments this supervisor gave, plus the dialog |
| `src/components/admin/DirectAssignDialog.astro` | the shared "Penugasan Langsung" dialog (admin + level 1) |
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
past periods) — run it after touching `src/lib/tasks.ts`; it exits non-zero on failure.

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

`direct-check.mjs` covers Penugasan Langsung end to end (dialog, reuse, `created_by`
scoping, the `penugasan-langsung` delete guard, the level-1 page and its 403s, mobile and
themes). It logs in as the real admin (`admin@assignment.id` / `password123`) and creates
`uji-%` accounts for the rest; it cleans both up, including any direct activities.

## Penugasan Langsung (direct assignments)

Two entry points, one component:

- **Admin** — a "Penugasan Langsung" button on `/dashboard/assignments`, next to the bulk
  dialog. `/dashboard/assignments` remains the only place to touch the whole catalog.
- **Level 1** — `/user/penugasan` (nav item "Penugasan", role 1 only). Deliberately *not*
  the admin page: this one is scoped to what the supervisor handed out themselves. Level 2
  is redirected to `/user`; admin is redirected to `/dashboard/assignments`
  (`requireAssigner` in `src/lib/auth.ts`).

The dialog is the "Tambah Aktivitas" form of `categories/[id].astro` minus the date/unit
choice: name, day, duration, periode, classification, frequency, SDM, computed volume, then
the recipient list grouped by level with the same jabatan badge and search/highlight as the
bulk dialog. The unit is never chosen — it is always `penugasan-langsung`.

`shortcut:` matching for reuse ignores `day`, so two jobs with the same name and periode are
one definition. Match `date` too if per-date variants are ever needed.

Accepted risk: there is no supervisor hierarchy table, so a level 1 can assign to *any*
level 1 or 2 — including other level 1s. Tighten when the org structure lands.

## Current state

- Uncommitted: the whole motion/actions rewrite (see `git status`).
- Done from the meeting agenda: master Posisi/Jabatan, dynamic kategori, Penugasan Massal,
  Notifikasi Pekerjaan Masuk, Penugasan Langsung.
- Still open: Red Notice for overdue work, Konsep Lembur (undecided), "konfirmasi selesai
  oleh pegawai" — today a task is done the moment the employee ticks it, with no approval
  step.
- Known follow-up: the Riwayat page's plain-form "Batalkan" button still causes a router
  re-render that jumps the scroll to the top — it can become an action like the rest.
