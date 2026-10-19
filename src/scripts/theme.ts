// The theme choice. The palette itself lives in global.css — this file only owns
// which theme is in effect and remembers the user's pick.
export type Theme = "light" | "dark" | "paper";

export const THEMES: Theme[] = ["light", "dark", "paper"];
export const THEME_KEY = "assignment-theme";

export function isTheme(value: unknown): value is Theme {
  return THEMES.includes(value as Theme);
}

export function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null; // storage blocked — the theme still applies for this page view
  }
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore: no storage, no remembering
  }
}

/** The theme in effect right now. */
export function currentTheme(): Theme {
  const theme = document.documentElement.dataset.theme;
  return isTheme(theme) ? theme : "light";
}

/** While the user has not picked a theme, follow the system preference. */
export function watchSystemTheme() {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", () => {
    if (storedTheme()) return; // an explicit choice wins
    document.documentElement.dataset.theme = media.matches ? "dark" : "light";
  });
}
