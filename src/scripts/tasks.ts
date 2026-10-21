// The DOM side of the task actions: the server answers with the new state, the page
// is patched to match. Nothing re-renders, so the scroll position stays where the
// visitor left it and the cards keep their identity.

export interface TaskStats {
  /** "Selesai hari ini" sebagai "2/3". */
  doneToday: string;
  missed: number;
  doneMonth: number;
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
