// Client helpers for the dashboard actions: an action mutates the data, then the
// page is re-rendered through the router — no full page load, and the scroll
// position stays where the admin left it.
import { navigate } from "astro:transitions/client";

/** Umpan balik singkat — lihat src/scripts/toast.ts untuk tone dan ikonnya. */
export { toast } from "./toast.ts";

/**
 * Render ulang halaman lewat router: data baru, tanpa muat ulang penuh.
 * Posisi scroll dikembalikan setelah pertukaran DOM, jadi admin tidak melompat
 * ke atas setiap kali menyimpan sesuatu.
 */
export async function refreshPage(url = location.href) {
  const top = window.scrollY;
  await navigate(url, { info: { instant: true } });
  window.scrollTo({ top, left: 0, behavior: "instant" });
}
