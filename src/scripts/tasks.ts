// The DOM side of the task actions: the server answers with the new state, the page
// is patched to match. Nothing re-renders, so the scroll position stays where the
// visitor left it and the cards keep their identity.

import { formatMinutes, graphCellTitle } from "../lib/format";

export interface TaskStats {
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

  // Batal centang mengembalikan lencana ke "Hari ini" bila memang jatuh tempo hari ini.
  const badge = card.querySelector<HTMLElement>("[data-task-badge]");
  if (badge) {
    const dueToday = card.dataset.dueToday === "true";
    badge.dataset.state = state.done ? (state.late ? "late" : "done") : dueToday ? "due" : "none";
    badge.textContent = state.done ? (state.late ? "Terlambat" : "Selesai") : dueToday ? "Hari ini" : "";
  }

  refreshGroupCounts(root);
}

/** Aksi sedang berjalan: kartunya diam dan tombolnya tidak bisa ditekan dua kali. */
export function setTaskPending(card: HTMLElement | null, pending: boolean) {
  if (!card) return;
  if (pending) card.setAttribute("aria-busy", "true");
  else card.removeAttribute("aria-busy");
}

/** Menulis penghitung rekap dari jawaban server. */
export function applyStats(stats: TaskStats, root: ParentNode = document) {
  const set = (name: string, value: string) => {
    const element = root.querySelector<HTMLElement>(`[data-stat="${name}"]`);
    if (element) element.textContent = value;
  };
  set("missed", String(stats.missed));
  set("done-month", String(stats.doneMonth));

  // The missed counter is the only one whose colour carries meaning, and it changes
  // after a chip is cleared — so the tone is set here, not once at render time.
  root.querySelectorAll<HTMLElement>('[data-stat="missed"]').forEach((element) => {
    element.classList.toggle("text-red-700", stats.missed > 0);
    element.classList.toggle("text-slate-900", stats.missed === 0);
  });
}

/** Menghitung ulang "x/y selesai" dan bar kemajuan tiap kelompok dari kartu-kartunya. */
export function refreshGroupCounts(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>("[data-group]").forEach((group) => {
    const cards = [...group.querySelectorAll<HTMLElement>("[data-task]")];
    const done = cards.filter((card) => card.dataset.done === "true").length;
    setProgress(group, done, cards.length);
  });

  refreshTodaySummary(root);
}

/**
 * Ringkasan "hari ini" di kepala halaman. Dihitung dari kartu yang jatuh tempo hari
 * ini, bukan dari kelompok — satu tugas harian dan satu tugas triwulan bisa sama-sama
 * jatuh tempo hari ini.
 */
export function refreshTodaySummary(root: ParentNode = document) {
  const summary = root.querySelector<HTMLElement>("[data-today-summary]");
  if (!summary) return;

  const cards = [...root.querySelectorAll<HTMLElement>('[data-task][data-due-today="true"]')];
  const open = cards.filter((card) => card.dataset.done !== "true");
  const done = cards.length - open.length;
  const minutes = open.reduce((sum, card) => sum + Number(card.dataset.minutes ?? 0), 0);

  // Warna dan ikon mengikuti atribut ini lewat CSS, jadi hanya satu hal yang ditulis.
  summary.dataset.open = String(open.length);

  const title = summary.querySelector<HTMLElement>("[data-summary-title]");
  if (title) {
    title.textContent = open.length > 0 ? `${open.length} tugas belum selesai` : "Tugas hari ini beres";
  }

  const detail = summary.querySelector<HTMLElement>("[data-summary-detail]");
  if (detail) {
    // Only the time budget while work remains: the "Hari ini" group header right below
    // already prints the done ratio, so repeating it here is noise.
    detail.textContent =
      open.length > 0
        ? minutes > 0
          ? `${formatMinutes(minutes)} lagi`
          : `${done}/${cards.length} selesai`
        : `${done}/${cards.length} tugas selesai`;
  }
}

/** "3/8 selesai" + lebar bar. Dipakai per kelompok dan untuk bilah hari ini. */
export function setProgress(scope: ParentNode, done: number, total: number) {
  const counter = scope.querySelector<HTMLElement>("[data-group-count]");
  if (counter) counter.textContent = `${done}/${total} selesai`;
  const bar = scope.querySelector<HTMLElement>("[data-progress-bar]");
  if (bar) bar.style.transform = `scaleX(${total > 0 ? done / total : 0})`;
}

/**
 * Lonceng setelah "sudah dibaca": angkanya hilang tanpa memuat ulang halaman.
 * Aman dipanggil dua kali — elemennya dicari saat dipakai.
 */
export function clearBell(root: ParentNode = document) {
  const bell = root.querySelector<HTMLElement>("[data-bell]");
  if (!bell) return;
  bell.querySelector("[data-bell-count]")?.remove();
  bell.dataset.unseen = "0";
  bell.setAttribute("aria-label", "Pekerjaan masuk");
  bell.setAttribute("title", "Pekerjaan masuk");
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
