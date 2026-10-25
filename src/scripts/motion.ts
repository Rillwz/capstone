// Micro-animation kit for the dashboard. Every animation in /dashboard runs through
// this module, so the whole area shares one timing vocabulary.
//
// House rules:
// - one family of curves: out-quint on the way in, out-accelerate on the way out;
// - nothing moves when the visitor asks for reduced motion — and the CSS that hides
//   the pre-animation state uses the same query, so no block is ever left invisible;
// - every helper is idempotent: calling one twice never plays it twice.
import { animate, hover, inView, press, scroll, stagger } from "motion";

/** Out-quint — the house curve: quick off the mark, long settle. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
/** Accelerating — for exits, so nothing lingers on the way out. */
export const EASE_IN: [number, number, number, number] = [0.55, 0, 1, 0.45];

type RevealShape = {
  opacity: number[];
  x?: number[];
  y?: number[];
  scaleX?: number[];
  scaleY?: number[];
};

/** Reveal shapes, picked per element with data-reveal="…". */
const SHAPES: Record<string, RevealShape> = {
  up: { opacity: [0, 1], y: [10, 0] },
  fade: { opacity: [0, 1] },
  left: { opacity: [0, 1], x: [-10, 0] },
  scale: { opacity: [0, 1], scaleX: [0.97, 1], scaleY: [0.97, 1] },
  // A proportion bar: it fills from its baseline. Opacity is pinned to 1 so the
  // shared pre-animation `[data-reveal] { opacity: 0 }` cannot leave it invisible.
  grow: { opacity: [1, 1], scaleX: [0, 1] },
};

const formatter = new Intl.NumberFormat("id-ID");

/** Rounded and thousands-separated — the number format the whole app uses. */
export const formatNumber = (value: number) => formatter.format(Math.round(value));

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** How many reveal elements already passed in the previous siblings — the cascade. */
const cascadeIndex = (element: HTMLElement) => {
  let index = 0;
  for (let node = element.previousElementSibling; node; node = node.previousElementSibling) {
    if (node instanceof HTMLElement && node.hasAttribute("data-reveal")) index++;
  }
  return index;
};

/** Fades the marked elements in as they scroll into view. */
export function reveal(root: ParentNode = document, instant = false) {
  const all = [...root.querySelectorAll<HTMLElement>("[data-reveal]")].filter(
    (element) => !element.dataset.revealed,
  );
  if (all.length === 0) return;

  // A page that arrives through a form action is already on screen: the blocks in
  // the viewport show at once, the ones below keep the scroll reveal.
  const onScreen = new Set<HTMLElement>();
  if (instant) {
    for (const element of all) {
      if (element.getBoundingClientRect().top < window.innerHeight - 40) onScreen.add(element);
    }
  }
  const elements = all.filter((element) => !onScreen.has(element));
  for (const element of onScreen) {
    element.dataset.revealed = "1";
    element.style.opacity = "1";
  }
  if (elements.length === 0) return;

  // One observer for every element: an observer per element is wasteful on long tables.
  const delays = new Map(elements.map((element) => [element, Math.min(cascadeIndex(element), 8) * 0.045]));
  for (const element of elements) element.dataset.revealed = "1";

  if (reduced()) return;

  inView(
    elements,
    (target) => {
      const element = target as HTMLElement;
      const shape = SHAPES[element.dataset.reveal ?? "up"] ?? SHAPES.up;
      animate(element, shape, { duration: 0.55, ease: EASE, delay: delays.get(element) ?? 0 });
    },
    { amount: 0.15, margin: "0px 0px -40px 0px" },
  );
}

/** Counts a number up to its value when the element scrolls into view. */
export function countUp(root: ParentNode = document, instant = false) {
  const all = [...root.querySelectorAll<HTMLElement>("[data-count]")].filter(
    (element) => !element.dataset.counted && Number.isFinite(Number(element.dataset.count)),
  );
  if (all.length === 0) return;

  // Same split as the reveal: a counter already on screen shows its value, the ones
  // below still count up when they come into view.
  const onScreen = new Set<HTMLElement>();
  if (instant) {
    for (const element of all) {
      if (element.getBoundingClientRect().top < window.innerHeight - 40) onScreen.add(element);
    }
  }
  const elements = all.filter((element) => !onScreen.has(element));
  for (const element of onScreen) {
    element.dataset.counted = "1";
    element.textContent = formatNumber(Number(element.dataset.count));
  }
  if (elements.length === 0) return;

  for (const element of elements) element.dataset.counted = "1";

  if (reduced()) return;

  inView(
    elements,
    (target) => {
      const element = target as HTMLElement;
      const to = Number(element.dataset.count);
      animate(0, to, {
        duration: 0.9,
        ease: EASE,
        onUpdate: (value) => {
          element.textContent = formatNumber(value);
        },
      });
    },
    { amount: 0.5 },
  );
}

/**
 * A number that changes because of an interaction (the work volume while a field
 * is typed): it counts from the old value to the new one instead of jumping.
 */
export function countTo(
  element: HTMLElement,
  to: number,
  format: (value: number) => string = formatNumber,
) {
  const from = Number(element.dataset.value ?? 0) || 0;
  element.dataset.value = String(to);

  if (reduced()) {
    element.textContent = format(to);
    return;
  }

  animate(from, to, {
    duration: 0.45,
    ease: EASE,
    onUpdate: (value) => {
      element.textContent = format(value);
    },
  });
}

/** Press feedback: a button sinks a touch and springs back. */
export function pressFeedback(root: ParentNode = document) {
  if (reduced()) return;

  // Buttons always; links only when they ask for it (data-press), so a nav link
  // never squashes under the cursor.
  root.querySelectorAll<HTMLElement>("button, a[data-press]").forEach((button) => {
    if (button.dataset.pressReady) return;
    button.dataset.pressReady = "1";

    press(button, (element) => {
      animate(element, { scaleX: 0.97, scaleY: 0.97 }, { type: "spring", stiffness: 700, damping: 40 });
      return () => {
        animate(element, { scaleX: 1, scaleY: 1 }, { type: "spring", stiffness: 500, damping: 20 });
      };
    });
  });
}

/** Cards lift a hair while the cursor is over them. */
export function hoverLift(root: ParentNode = document) {
  if (reduced()) return;

  root.querySelectorAll<HTMLElement>("[data-lift]").forEach((card) => {
    if (card.dataset.liftReady) return;
    card.dataset.liftReady = "1";

    hover(card, (element) => {
      animate(element, { y: -2 }, { type: "spring", stiffness: 420, damping: 26 });
      return () => animate(element, { y: 0 }, { type: "spring", stiffness: 420, damping: 30 });
    });
  });
}

/**
 * Dialogs: the content arrives in sequence when the dialog opens and lifts out
 * when it closes. The dialog panel itself already has a CSS transition; Motion
 * only touches what is inside it, so the two never fight over the same property.
 */
export function dialogMotion(root: ParentNode = document) {
  if (reduced()) return;

  root.querySelectorAll<HTMLDialogElement>("dialog").forEach((dialog) => {
    if (dialog.dataset.motionReady) return;
    dialog.dataset.motionReady = "1";

    /** The content blocks: the children of the panel, or of the dialog itself. */
    const blocks = () => {
      const children = [...dialog.children].filter(
        (child): child is HTMLElement => child instanceof HTMLElement,
      );
      if (children.length === 1) {
        const inner = [...children[0].children].filter(
          (child): child is HTMLElement => child instanceof HTMLElement,
        );
        return inner.length ? inner : children;
      }
      return children;
    };

    const playOpen = () => {
      animate(blocks(), { opacity: [0, 1], y: [8, 0] }, { duration: 0.4, ease: EASE, delay: stagger(0.05) });
    };

    // Open: the blocks arrive one after another.
    new MutationObserver(() => {
      if (dialog.open) playOpen();
    }).observe(dialog, { attributes: true, attributeFilter: ["open"] });

    // Close: the content lifts out first, then the dialog actually closes.
    const nativeClose = dialog.close.bind(dialog);
    const dismiss = () => {
      const content = blocks();
      if (content.length === 0) {
        nativeClose();
        return;
      }
      animate(content, { opacity: 0, y: -6 }, { duration: 0.14, ease: EASE_IN, onComplete: nativeClose });
    };
    dialog.close = dismiss;
    // Esc: the browser closes on its own, so the kit takes that over.
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      dismiss();
    });

    // A dialog that is already open when the kit loads (?add=1) still animates.
    if (dialog.open) playOpen();
  });
}

/**
 * Reading progress in the header: pinned to the bottom edge, following the
 * scroll position. Only one transform is written per scroll event, so nothing
 * is laid out again.
 */
export function scrollProgress(root: ParentNode = document) {
  if (reduced()) return;

  root.querySelectorAll<HTMLElement>("[data-scroll-progress]").forEach((bar) => {
    if (bar.dataset.progressReady) return;
    bar.dataset.progressReady = "1";

    scroll((progress) => {
      bar.style.transform = `scaleX(${progress})`;
    });
  });
}

// Everything that can wire itself up as soon as the page is ready.
//
// Astro's router swaps the DOM but keeps this module cached, so the wiring has to be
// redone after every navigation.
//
// The entrance plays again on a link navigation — that is the page transition now.
// A form action (mark done, save a note) updates the page in place instead: the
// visitor just touched that page, replaying the whole entrance there would be noise.
// Going back (traverse) and re-rendering after an action (info.instant) do not
// replay it either.
let instantArrival = false;
document.addEventListener("astro:before-preparation", (event) => {
  const detail = event as Event & {
    formData?: FormData;
    navigationType?: string;
    info?: { instant?: boolean };
  };
  instantArrival =
    Boolean(detail.formData) ||
    detail.navigationType === "traverse" ||
    Boolean(detail.info?.instant);
});

const init = () => {
  const instant = instantArrival;
  instantArrival = false;

  reveal(document, instant);
  countUp(document, instant);
  pressFeedback();
  hoverLift();
  dialogMotion();
  scrollProgress();
};

document.addEventListener("astro:page-load", init);
init();
