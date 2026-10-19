import type { DefaultSession } from "@auth/core/types";

type SessionUser = DefaultSession["user"] & { role?: number; id?: string };

declare module "@auth/core/types" {
  interface User {
    role?: number;
  }
  interface Session {
    user: SessionUser;
  }
}

declare module "next-auth" {
  interface User {
    role?: number;
  }
  interface Session {
    user: SessionUser;
  }
}
