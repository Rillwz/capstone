---
name: mpp-import
description: Import the MPP (Matriks Rencana Kerja) spreadsheet into the capstone app's activity catalog — "Jenis Aktivitas Unit Kerja" per work unit. Use this whenever the user mentions MPP.xlsx, the MPP / matriks rencana kerja file, importing or re-importing aktivitas from a spreadsheet, or adding/updating a unit's activity list from Excel — even when they don't say "import". It audits the file first, so the app's period vocabulary and validation limits are ready before a single row is written.
metadata:
  opencode/slash: "true"
---

# Import MPP ke katalog aktivitas

`MPP.xlsx` (repo root, gitignored) is the source of truth for "Jenis Aktivitas Unit
Kerja": 11 sheets = the 11 work units, ~200 rows. The app keeps them in the `activities`
table, and the whole user workspace is derived from them.

The order of operations is the point of this skill: **audit the file, make the app able
to hold it, then write once.** Importing first and reacting to the errors costs a
half-written database, duplicate rows, and a second pass over every value.

## 1. Audit the file — never write before this

```sh
python3 .opencode/skills/mpp-import/scripts/mpp.py audit MPP.xlsx
```

The report covers: rows per sheet, the value ranges (name length, frequency, minutes,
SDM), the period vocabulary with the app's mapping, the anomalies (flags in the wrong
column, duplicate names, free-text dates, broken total formulas), and — by running the
app's own validation — exactly which rows the app would reject and why.

## 2. Make the app able to hold the file

The file decides the values; the app follows. Two things usually need to change.

**A period the app doesn't know yet** (e.g. `Kegiatan`, `Triwulan`, `Tahunan`):

| Touchpoint | What it needs |
| --- | --- |
| `src/lib/activities.ts` | `PERIODES` — the vocabulary; the `Periode` type follows from it |
| `src/lib/tasks.ts` | `currentPeriodKey`, `periodFromKey`, `pastPeriods`, `dueDate` — one case per period |
| `src/lib/format.ts` | `formatPeriod`, `formatPeriodShort` — the label |
| `src/pages/user.astro` | the `groups` array — a period without a group is invisible |
| `src/lib/db.ts` | the CHECK constraint on `activities.periode` — rebuild the table (foreign keys off while swapping, so assignments and logs survive) |
| `src/actions/index.ts` | the zod schema — use `z.enum([...PERIODES])`, never a literal list |

**A value range the file exceeds** (1631 frequencies/year, 5600 minutes, 375-character
names, rows with no classification at all): widen the limits in `parseActivityValues`
(`src/lib/activities.ts`) *and* the matching zod schema in `src/actions/index.ts`, so the
imported rows stay editable in the UI afterwards. A row with no classification is legal
data — the three flags are independent.

Then check the engine:

```sh
bun run src/scripts/check-tasks.ts
```

## 3. Extract, back up, import

```sh
python3 .opencode/skills/mpp-import/scripts/mpp.py extract MPP.xlsx data/mpp.json
cp data/app.db /tmp/app.db.backup     # the DB holds the owner's real data — always
bun src/scripts/import-mpp.ts
```

The importer runs every row through the app's own `parseActivityValues` and upserts by
(category + name) inside one transaction, so a rejected row leaves nothing behind and a
re-run updates rows instead of duplicating them.

## 4. Verify

```sh
python3 .opencode/skills/mpp-import/scripts/mpp.py verify data/mpp.json
```

Expect every row to match the file (0 differences), the counts per category, and the
owner's data untouched (assignments, logs, notes, posts). Then `npx astro check`,
`npx astro build`, and open one category page in the browser.

## The file's own quirks (from the first run)

- **Flags in the wrong column** — a few rows carry the `v` under "Bukan Tupoksi"
  instead of "Utama"/"Periodik". The import copies the file faithfully; report those
  rows so the spreadsheet can be fixed, then re-import.
- **Duplicate names** — the file has rows with the same name inside one unit; the
  importer collapses them onto one row.
- **Dates are free text** ("25 di Tiap Bulannya"): the day number is extracted, and an
  empty date column means day 0 = no date.
- **The summary rows are unreliable** — several sheets' `TOTAL VOLUME KERJA` formula
  covers only part of the data. The app never reads them; ignore them.
- **Casing and labels are normalized** to the app's vocabulary ("semester" →
  "Semesteran", "harian" → "Harian"); the raw value stays visible in the audit report.
- The `Tupoksi` column (merged per group of rows) has no field in the app, so it is not
  imported.
