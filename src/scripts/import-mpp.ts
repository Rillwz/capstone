/**
 * Impor aktivitas MPP (Matriks Rencana Kerja) ke tabel activities.
 *
 *   python3 src/scripts/extract-mpp.py   # MPP.xlsx -> data/mpp.json
 *   bun run src/scripts/import-mpp.ts    # data/mpp.json -> database
 *
 * Baris yang sama (kategori + nama) diperbarui, bukan diduplikasi, jadi impor
 * bisa diulang setelah file MPP diperbaiki. Nilai yang diimpor: tanggal (0 =
 * tanpa tanggal), klasifikasi, periode, frekuensi, durasi, dan jumlah SDM —
 * persis seperti di file.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseActivityValues } from "../lib/activities";
import { createActivity, db, listActivities, updateActivity } from "../lib/db";

interface MppRow {
  category_id: string;
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
  /** Isian mentah dari file, hanya untuk pesan galat. */
  raw_date?: string;
  raw_periode?: string;
}

const source = process.argv[2] ?? join(process.cwd(), "data", "mpp.json");
const rows = JSON.parse(readFileSync(source, "utf8")) as MppRow[];

// Satu baris per kategori + nama, supaya impor ulang memperbarui, bukan menambah.
const existing = new Map<string, number>();
for (const categoryId of new Set(rows.map((row) => row.category_id))) {
  for (const activity of listActivities(categoryId)) {
    existing.set(`${categoryId} ${activity.name}`, activity.id);
  }
}

let created = 0;
let updated = 0;
const skipped: string[] = [];

// Satu transaksi: baris yang ditolak tidak boleh meninggalkan database setengah jadi.
db.transaction(() => {
  for (const row of rows) {
    const parsed = parseActivityValues({
      name: row.name,
      // MPP hanya menyimpan hari; rentang mulai & tenggat dibiarkan kosong supaya
      // aktivitas itu berlaku sejak penugasan dibuat dan berulang tanpa batas.
      start_date: "",
      end_date: "",
      utama: row.utama,
      periodik: row.periodik,
      bukan_tupoksi: row.bukan_tupoksi,
      periode: row.periode,
      frequency: row.frequency,
      minutes: row.minutes,
      sdm: row.sdm,
    });

    if ("error" in parsed) {
      skipped.push(`${row.sheet} baris ${row.source_row}: ${parsed.error}`);
      continue;
    }

    const key = `${row.category_id} ${row.name}`;
    const id = existing.get(key);
    if (id) {
      updateActivity(id, row.category_id, parsed.value);
      updated++;
    } else {
      // Id baru langsung masuk peta: file MPP punya baris dengan nama yang sama.
      existing.set(key, createActivity(row.category_id, parsed.value));
      created++;
    }
  }
})();

db.close();

console.log(`${rows.length} baris MPP: ${created} baru, ${updated} diperbarui`);
if (skipped.length) {
  console.log(`\n${skipped.length} baris dilewati:`);
  for (const line of skipped) console.log(`  ${line}`);
}
