/**
 * Password handed to newly created users, to a password reset, and to the seed script.
 * Fixed in code on purpose: an env override here would let a deploy quietly change the
 * password every new account gets (and the one shown on /dashboard/users).
 */
export const DEFAULT_USER_PASSWORD = "12345678";
