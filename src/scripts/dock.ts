// The docked dashboard menu (lg+): full list or an icon rail. The state lives as
// data-dock-mini on <html>, so CSS owns the transition — JS only flips the attribute.
const KEY = "assignment-dock";

export function isDockMini(): boolean {
  try {
    return localStorage.getItem(KEY) === "mini";
  } catch {
    return false; // storage blocked — the rail still toggles for this page view
  }
}

export function setDockMini(mini: boolean) {
  if (mini) document.documentElement.dataset.dockMini = "1";
  else delete document.documentElement.dataset.dockMini;

  try {
    localStorage.setItem(KEY, mini ? "mini" : "full");
  } catch {
    // ignore: no storage, no remembering
  }
}
