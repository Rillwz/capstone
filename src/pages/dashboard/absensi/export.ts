// Export Absensi as CSV. A plain GET — it is a link, so it works without JavaScript, keeps
// the current period and filter in the URL, and lands in the browser's download history.
//
// Semicolon-separated with a UTF-8 BOM: that is what Excel in an Indonesian locale expects,
// and without the BOM accents come out mangled. Every cell goes through `csvCell`, which
// defuses formula injection — names and jabatan are admin-supplied text.
import type { APIRoute } from "astro";
import { requireAdmin } from "../../../lib/auth";
import {
  listAttendanceMissing,
  listAttendanceMonthCells,
  listAttendanceRecap,
  listAttendanceSummary,
} from "../../../lib/db";
import { buildAttendanceCsv, parseReportPeriod, type CsvDailyRow, type CsvSummaryRow } from "../../../lib/attendance";
import { formatClock } from "../../../lib/format";
import { todayIso } from "../../../lib/tasks";

export const GET: APIRoute = async (context) => {
  // Same gate as the page: a CSV is still the admin's data, not the world's.
  const session = await requireAdmin(context);
  if (session instanceof Response) return session;

  const params = context.url.searchParams;
  const q = (params.get("q") ?? "").trim().slice(0, 100);
  const period = parseReportPeriod(
    { mode: params.get("mode"), tanggal: params.get("tanggal"), bulan: params.get("bulan"), tahun: params.get("tahun") },
    todayIso(),
  );

  let daily: CsvDailyRow[] = [];
  let summary: CsvSummaryRow[] = [];
  const months = new Map<number, Map<number, number>>();

  if (period.mode === "harian") {
    // Present rows carry their times; absentees are appended so the file shows the gaps.
    const present = listAttendanceRecap(period.start, q).map((row) => ({
      name: row.name,
      email: row.email,
      jabatan: row.jabatan,
      role: row.role,
      tanggal: period.start,
      masuk_at: row.masuk_at,
      masuk_location: row.masuk_location,
      masuk_distance: row.masuk_distance,
      masuk_accuracy: row.masuk_accuracy,
      pulang_at: row.pulang_at,
      pulang_location: row.pulang_location,
      pulang_distance: row.pulang_distance,
      pulang_accuracy: row.pulang_accuracy,
    }));
    const absent = listAttendanceMissing(period.start, q).map((row) => ({
      name: row.name,
      email: row.email,
      jabatan: row.jabatan,
      role: row.role,
      tanggal: period.start,
      masuk_at: null,
      masuk_location: null,
      masuk_distance: null,
      masuk_accuracy: null,
      pulang_at: null,
      pulang_location: null,
      pulang_distance: null,
      pulang_accuracy: null,
    }));
    daily = [...present, ...absent];
  } else {
    summary = listAttendanceSummary(period.start, period.end, q);
    if (period.mode === "tahunan") {
      for (const cell of listAttendanceMonthCells(period.start, period.end, q)) {
        const row = months.get(cell.user_id) ?? new Map<number, number>();
        row.set(cell.month, cell.days_in);
        months.set(cell.user_id, row);
      }
    }
  }

  const body = buildAttendanceCsv({ period, daily, summary, months }, formatClock);
  const filename = `absensi-${period.mode}-${period.key}.csv`;

  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
};
