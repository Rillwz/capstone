import Credentials from "@auth/core/providers/credentials";
import { defineConfig } from "auth-astro";
import { CredentialsSignin } from "@auth/core/errors";
import bcrypt from "bcryptjs";
import { getUserByEmail, getUserById, recordLogin } from "./src/lib/db";

export default defineConfig({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Kata Sandi", type: "password" },
      },
      async authorize(credentials, request) {
        const email = typeof credentials?.email === "string" ? credentials.email : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const user = getUserByEmail(email);
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;

        // Login log for the admin area: ip + device (user agent) + time.
        const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0];
        const ip = (forwarded ?? request.headers.get("x-real-ip") ?? "127.0.0.1").trim();
        recordLogin(user.id, ip, request.headers.get("user-agent") ?? "Tidak dikenal");

        // Role travels inside the session token via the jwt callback.
        return { id: String(user.id), name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  secret: import.meta.env.AUTH_SECRET,
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: number }).role ?? 1;
        return token;
      }
      // The token outlives a rename or a password change, so re-read the row instead of
      // trusting what the cookie says.
      const row = token.sub ? getUserById(Number(token.sub)) : undefined;
      if (row) {
        token.name = row.name;
        token.email = row.email;
        token.role = row.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as number;
        // token.sub holds the id returned by authorize() — the dashboard needs it.
        if (token.sub) session.user.id = token.sub;
      }
      return session;
    },
  },
});

export { CredentialsSignin };
