// Display helpers for the admin area.

import type { Periode } from "./activities";
import { periodFromKey } from "./tasks";

/** SQLite stores datetimes as UTC "YYYY-MM-DD HH:MM:SS" (datetime('now')). */
export function parseDbDate(value: string): Date {
  return new Date(`${value.replace(" ", "T")}Z`);
}

export function formatDateTime(value: string): string {
  return parseDbDate(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  });
}

/** Activity rows show the day only ("13"); a row saved without a date shows a dash. */
export function formatDay(value: string): string {
  return value ? String(Number(value.slice(8, 10))) : "–";
}

/** A plain civil date ("YYYY-MM-DD") as "20 Okt 2026". */
export function formatDate(value: string): string {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

/** A period key as a readable label: "20 Okt 2026", "Minggu 43 · 20–26 Okt 2026", … */
export function formatPeriod(periode: Periode, key: string): string {
  switch (periode) {
    case "Harian":
      return formatDate(key);
    case "Mingguan": {
      const { start, end } = periodFromKey(periode, key);
      return `Minggu ${key.slice(6)} · ${formatDate(start)} – ${formatDate(end)}`;
    }
    case "Bulanan":
      return new Date(`${key}-01T00:00:00Z`).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      });
    case "Semesteran":
      return `Semester ${key.endsWith("S1") ? 1 : 2} ${key.slice(0, 4)}`;
  }
}

export function roleLabel(role: number): string {
  return role === 0 ? "Admin" : `Level ${role}`;
}

const OS_LABELS: Array<[RegExp, string]> = [
  [/Windows NT/, "Windows"],
  [/(iPhone|iPad|iPod)/, "iOS"],
  [/Android/, "Android"],
  [/Mac OS X|Macintosh/, "macOS"],
  [/Linux/, "Linux"],
];

const BROWSER_LABELS: Array<[RegExp, string]> = [
  [/Edg\/|EdgA\//, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/Firefox\//, "Firefox"],
  [/(Chrome|CriOS)\//, "Chrome"],
  [/Safari\//, "Safari"],
];

function firstMatch(labels: Array<[RegExp, string]>, value: string): string | null {
  for (const [pattern, label] of labels) if (pattern.test(value)) return label;
  return null;
}

/** Rough "browser · OS" label from a user agent, enough to tell sessions apart. */
export function describeDevice(userAgent: string): string {
  const browser = firstMatch(BROWSER_LABELS, userAgent);
  const os = firstMatch(OS_LABELS, userAgent);
  if (browser && os) return `${browser} · ${os}`;
  return browser ?? os ?? "Tidak dikenal";
}
