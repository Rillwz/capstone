// Toast notifications: one reusable panel for every short-lived feedback in the app.
// The tone decides the icon and the colour, so a call site only names what happened.
//
// Two sources feed the same panel: an action that just ran (toast(...) from the page
// script) and a server redirect that carried a flag (?saved=1), drained on page load.
//
// The router swaps the DOM but keeps this module, so the region and the flashes are
// looked up again on every astro:page-load.
import { animate } from "motion";
import { EASE_IN } from "./motion.ts";

export type ToastTone = "success" | "error" | "warning" | "info";

/** How long each tone stays on screen — errors and warnings need longer to read. */
const TTL: Record<ToastTone, number> = { success: 4000, warning: 6000, error: 6000, info: 4000 };

const ICON_TONE: Record<ToastTone, string> = {
  success: "text-emerald-400",
  error: "text-red-400",
  warning: "text-amber-400",
  info: "text-brand-300",
};

const BAR_TONE: Record<ToastTone, string> = {
  success: "bg-emerald-400",
  error: "bg-red-400",
  warning: "bg-amber-400",
  info: "bg-brand-300",
};

export interface ToastOptions {
  /** Milliseconds on screen; defaults by tone. */
  duration?: number;
  /** One inline button — the undo window on /dashboard/users. */
  action?: { label: string; onClick: () => void };
}

export interface ToastHandle {
  el: HTMLElement;
  dismiss: () => void;
}

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The stack of toasts; created on demand for pages without ToastRegion (login). */
function region(): HTMLElement {
  const found = document.getElementById("toast-region");
  if (found) return found;

  const created = document.createElement("div");
  created.id = "toast-region";
  created.className =
    "pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4";
  document.body.append(created);
  return created;
}

/** Icons are single-source in ToastRegion so nothing here writes raw SVG. */
function icon(tone: ToastTone): Node | null {
  const template = document.querySelector<HTMLTemplateElement>(
    `template[data-toast-icon="${tone}"]`,
  );
  return template?.content.cloneNode(true) ?? null;
}

/**
 * Show a toast. Returns a handle so a caller that owns a longer window (the delete
 * undo) can close it early.
 */
export function toast(
  message: string,
  tone: ToastTone = "success",
  options: ToastOptions = {},
): ToastHandle {
  const duration = options.duration ?? TTL[tone];

  const el = document.createElement("div");
  el.className =
    "toast pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl bg-inverse text-oninverse shadow-2xl";
  // role=status is politely announced, error is assertive.
  el.setAttribute("role", tone === "error" ? "alert" : "status");

  const content = document.createElement("div");
  content.className = "flex items-start gap-3 px-4 py-3";

  const iconHost = document.createElement("span");
  iconHost.className = `mt-0.5 shrink-0 ${ICON_TONE[tone]}`;
  const glyph = icon(tone);
  if (glyph) iconHost.append(glyph);

  const text = document.createElement("p");
  text.className = "min-w-0 flex-1 text-sm";
  text.textContent = message;

  content.append(iconHost, text);

  if (options.action) {
    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "inline-flex shrink-0 items-center rounded-lg px-2.5 py-1.5 text-sm font-semibold text-brand-300 transition-colors hover:bg-oninverse/10 hover:text-oninverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400";
    button.textContent = options.action.label;
    button.addEventListener("click", options.action.onClick);
    content.append(button);
  }

  el.append(content);

  let timer = 0;

  // The visual countdown only makes sense when the visitor can still act on it.
  if (options.action) {
    const track = document.createElement("div");
    track.className = "h-1 bg-oninverse/15";
    const bar = document.createElement("div");
    bar.className = `h-full ${BAR_TONE[tone]} toast-countdown`;
    bar.style.animationDuration = `${duration}ms`;
    track.append(bar);
    el.append(track);
  }

  region().append(el);
  if (!reduced()) {
    animate(el, { opacity: [0, 1], y: [16, 0] }, { type: "spring", stiffness: 420, damping: 30 });
  }

  let gone = false;
  const dismiss = () => {
    if (gone) return;
    gone = true;
    window.clearTimeout(timer);
    if (reduced()) {
      el.remove();
      return;
    }
    animate(
      el,
      { opacity: 0, y: 12 },
      { duration: 0.18, ease: EASE_IN, onComplete: () => el.remove() },
    );
  };

  timer = window.setTimeout(dismiss, duration);
  return { el, dismiss };
}

/**
 * A redirect that carried `?saved=1` renders a hidden ToastFlash; it becomes a toast
 * here and its URL parameter is dropped, so a refresh cannot show it twice.
 */
function drainFlashes() {
  document.querySelectorAll<HTMLElement>("[data-toast-flash]").forEach((node) => {
    const message = (node.textContent ?? "").trim();
    const tone = (node.dataset.tone as ToastTone | undefined) ?? "success";
    const params = (node.dataset.params ?? "")
      .split(",")
      .map((param) => param.trim())
      .filter(Boolean);

    node.remove();

    if (params.length > 0) {
      const url = new URL(location.href);
      params.forEach((key) => url.searchParams.delete(key));
      history.replaceState(null, "", url.pathname + url.search + url.hash);
    }

    if (message) toast(message, tone);
  });
}

document.addEventListener("astro:page-load", drainFlashes);
drainFlashes();
