/**
 * Validasi baris hasil ekstraksi MPP dengan aturan aplikasi — persis yang dipakai
 * importer (parseActivityValues), jadi baris yang akan ditolak bisa diketahui
 * SEBELUM apa pun ditulis ke database.
 *
 *   bun run .opencode/skills/mpp-import/scripts/validate.ts data/mpp.json
 *
 * Semua baris yang gagal_rules dicetak beserta alasannya; kalau tidak ada, keluarannya
 * "semua baris lolos".
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const target = process.argv[2] ?? "data/mpp.json";
const rows = JSON.parse(readFileSync(target, "utf8")) as Array<{
  sheet: string;
  source_row: number;
  name: string;
  day: number;
  utama: boolean;
  periodik: boolean;
  bukan_tupoksi: boolean;
  periode: string;
  frequency: number;
  minutes: number;
  sdm: number;
}>;

// Modul aplikasi diambil dari folder kerja, jadi skill ini jalan dari root repo.
const app = await import(
  pathToFileURL(join(process.cwd(), "src", "lib", "activities.ts")).href
);
const { parseActivityValues } = app;

const rejected: string[] = [];
for (const row of rows) {
  const parsed = parseActivityValues({
    name: row.name,
    day: row.day,
    utama: row.utama,
    periodik: row.periodik,
    bukan_tupoksi: row.bukan_tupoksi,
    periode: row.periode,
    frequency: row.frequency,
    minutes: row.minutes,
    sdm: row.sdm,
  });
  if ("error" in parsed) {
    rejected.push(`${row.sheet} baris ${row.source_row}: ${parsed.error}`);
  }
}

if (rejected.length === 0) {
  console.log(`semua baris lolos (${rows.length})`);
} else {
  console.log(`${rejected.length} dari ${rows.length} baris ditolak:`);
  for (const line of rejected) console.log(`  ${line}`);
}
