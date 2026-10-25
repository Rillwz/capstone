// The DOM side of the task actions: the server answers with the new state, the page
// is patched to match. Nothing re-renders, so the scroll position stays where the
// visitor left it and the cards keep their identity.

import { graphCellTitle } from "../lib/format";

export interface TaskStats {
  /** "Selesai hari ini" sebagai "2/3". */
  doneToday: string;
  missed: number;
  doneMonth: number;
}

/** Rekap harian per tanggal, bentuk kiriman server. */
export type GraphDays = Record<string, { done: number; missed: number }>;

/** Tahun yang sedang ditampilkan grafik, untuk minta penyegaran. */
export function graphYear(root: ParentNode = document): number | undefined {
  const value = Number(root.querySelector<HTMLElement>("[data-graph]")?.dataset.graphYear);
  return Number.isInteger(value) ? value : undefined;
}

/**
 * Menyalakan ulang grafik kontribusi dari rekap harian kiriman server.
 *
 * Kotak digambar ulang hanya untuk tahun yang sedang dilihat, jadi pindah tahun
 * tidak merusak grafik yang lain.
 */
export function patchGraph(days: GraphDays | undefined, root: ParentNode = document) {
  if (!days) return;
  const graph = root.querySelector<HTMLElement>("[data-graph]");
  if (!graph) return;
  const year = graph.dataset.graphYear ?? "";

  graph.querySelectorAll<HTMLElement>("[data-graph-cell][data-date]").forEach((cell) => {
    const date = cell.dataset.date ?? "";
    const bucket = days[date] ?? { done: 0, missed: 0 };
    cell.dataset.level = String(Math.min(bucket.done, 4));
    if (bucket.missed > 0) cell.dataset.missed = "1";
    else delete cell.dataset.missed;
    cell.title = graphCellTitle(date, bucket.done, bucket.missed);
  });

  let doneTotal = 0;
  let missedTotal = 0;
  let activeDays = 0;
  for (const [date, bucket] of Object.entries(days)) {
    if (!date.startsWith(year)) continue;
    doneTotal += bucket.done;
    missedTotal += bucket.missed;
    if (bucket.done + bucket.missed > 0) activeDays++;
  }

  const summary = graph.querySelector<HTMLElement>("[data-graph-summary]");
  if (summary) {
    summary.textContent = `${doneTotal} selesai · ${missedTotal} terlewat · ${activeDays} hari dengan aktivitas`;
  }

  const grid = graph.querySelector<HTMLElement>("[data-graph-grid]");
  if (grid) {
    grid.setAttribute(
      "aria-label",
      `Grafik aktivitas ${year}: ${doneTotal} tugas selesai, ${missedTotal} terlewat, ${activeDays} hari dengan aktivitas`,
    );
  }
}

/** Menandai satu kartu selesai (atau membatalkannya) dan menyelaraskan hitungannya. */
export function setTaskState(
  card: HTMLElement,
  state: { done: boolean; late: boolean; name: string },
  root: ParentNode = document,
) {
  card.dataset.done = String(state.done);

  const toggle = card.querySelector<HTMLElement>("[data-task-toggle]");
  if (toggle) {
    toggle.dataset.state = state.done ? "done" : "open";
    toggle.setAttribute("aria-label", `${state.done ? "Batalkan tanda selesai" : "Tandai selesai"}: ${state.name}`);
    toggle.title = state.done ? "Batalkan tanda selesai" : "Tandai selesai";
  }

  const badge = card.querySelector<HTMLElement>("[data-task-badge]");
  if (badge) badge.dataset.state = state.done ? (state.late ? "late" : "done") : "none";

  refreshGroupCounts(root);
}

/** Menulis tiga penghitung dari jawaban server. */
export function applyStats(stats: TaskStats, root: ParentNode = document) {
  const set = (name: string, value: string) => {
    const element = root.querySelector<HTMLElement>(`[data-stat="${name}"]`);
    if (element) element.textContent = value;
  };
  set("done-today", stats.doneToday);
  set("missed", String(stats.missed));
  set("done-month", String(stats.doneMonth));
}

/** Menghitung ulang "x/y selesai" tiap kelompok dari kartu-kartunya. */
export function refreshGroupCounts(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>("[data-group]").forEach((group) => {
    const counter = group.querySelector<HTMLElement>("[data-group-count]");
    if (!counter) return;
    const cards = [...group.querySelectorAll<HTMLElement>("[data-task]")];
    const done = cards.filter((card) => card.dataset.done === "true").length;
    counter.textContent = `${done}/${cards.length} selesai`;
  });
}

/** Memasang catatan & tautan pada satu kartu (kosong keduanya berarti dihapus). */
export function setTaskNote(card: HTMLElement, note: string, link: string) {
  const text = card.querySelector<HTMLElement>("[data-note-text]");
  if (text) {
    text.textContent = note;
    text.title = note;
    text.classList.toggle("hidden", !note);
  }

  const anchor = card.querySelector<HTMLAnchorElement>("[data-note-link]");
  if (anchor) {
    anchor.setAttribute("href", link || "#");
    anchor.setAttribute("data-note-url", link);
    anchor.title = link;
    anchor.classList.toggle("hidden", !link);
    const host = anchor.querySelector<HTMLElement>("[data-note-host]");
    if (host) host.textContent = link ? hostOf(link) : "";
  }
}

/** Host dari sebuah tautan, untuk label chip-nya. */
function hostOf(link: string): string {
  try {
    return new URL(link).host.replace(/^www\./, "");
  } catch {
    return link;
  }
}
