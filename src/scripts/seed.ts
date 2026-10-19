/**
 * Seed initial users — run with: bun run src/scripts/seed.ts
 * Creates an admin (role 0) plus demo users (role 1, 2) with the default password
 * (or SEED_PASSWORD).
 */
import bcrypt from "bcryptjs";
import { getUserByEmail, createUser, db } from "../lib/db";
import { DEFAULT_USER_PASSWORD } from "../lib/defaults";

const password = process.env.SEED_PASSWORD ?? DEFAULT_USER_PASSWORD;
const hash = bcrypt.hashSync(password, 10);

const users: Array<{ name: string; email: string; role: 0 | 1 | 2 }> = [
  { name: "Admin", email: "admin@assignment.id", role: 0 },
  { name: "Dosen", email: "dosen1@assignment.id", role: 1 },
  { name: "Dosen", email: "dosen2@assignment.id", role: 2 },
];

for (const u of users) {
  if (getUserByEmail(u.email)) {
    console.log(`skip (exists): ${u.email}`);
  } else {
    createUser(u.name, u.email, hash, u.role);
    console.log(`created: ${u.email} (role ${u.role})`);
  }
}

db.close();
console.log(`\nDone. Password for all seeded users: "${password}"`);
