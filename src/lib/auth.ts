import type { AstroGlobal } from "astro";
import { getSession } from "auth-astro/server";

/**
 * Session gate for pages any signed-in account may open (/profile). Returns the session,
 * or a redirect Response the page must return as-is.
 */
export async function requireSession(Astro: Pick<AstroGlobal, "request" | "redirect">) {
  const session = await getSession(Astro.request);
  if (!session) return Astro.redirect("/login?error=SessionRequired");
  return session;
}

/**
 * Admin gate for /dashboard pages. Returns the session, or a redirect Response
 * the page must return as-is: `const session = await requireAdmin(Astro); if (session instanceof Response) return session;`
 * A signed-in non-admin is sent to "/" (the role dispatcher), not back to the login page.
 */
export async function requireAdmin(Astro: Pick<AstroGlobal, "request" | "redirect">) {
  const session = await requireSession(Astro);
  if (session instanceof Response) return session;
  if (session.user?.role !== 0) return Astro.redirect("/");
  return session;
}

/**
 * Gate for the level 1 & 2 area (/user): any signed-in account except an admin,
 * who is sent to the admin dashboard.
 */
export async function requireUser(Astro: Pick<AstroGlobal, "request" | "redirect">) {
  const session = await requireSession(Astro);
  if (session instanceof Response) return session;
  if (session.user?.role === 0) return Astro.redirect("/dashboard");
  return session;
}

/**
 * Gate for /user/penugasan — the page where level 1 hands out direct assignments.
 * Admin gets the richer admin page instead; level 2 cannot assign at all.
 */
export async function requireAssigner(Astro: Pick<AstroGlobal, "request" | "redirect">) {
  const session = await requireSession(Astro);
  if (session instanceof Response) return session;
  if (session.user?.role === 0) return Astro.redirect("/dashboard/assignments");
  if (session.user?.role !== 1) return Astro.redirect("/user");
  return session;
}
