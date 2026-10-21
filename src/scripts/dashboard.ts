// Client helpers for the dashboard actions: an action mutates the data, then the
// page is re-rendered through the router — no full page load, and the scroll
// position stays where the admin left it.
import { navigate } from "astro:transitions/client";

/** Umpan balik singkat di atas halaman — pengganti banner dari parameter URL. */
export function toast(message: string, tone: "success" | "error" = "success") {
  const host = document.querySelector("main") ?? document.body;
  const notice = document.createElement("p");
  notice.className = [
    "notice mt-6 rounded-lg px-3 py-2 text-sm",
    tone === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700",
  ].join(" ");
  notice.setAttribute("role", "status");
  notice.textContent = message;
  host.prepend(notice);

  setTimeout(() => {
    notice.classList.add("is-leaving");
    setTimeout(() => notice.remove(), 400);
  }, 4000);
}

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
