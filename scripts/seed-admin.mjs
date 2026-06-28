/**
 * Generate a bcrypt password hash for the admin account.
 *
 * Usage:
 *   npm run seed-admin -- "your-strong-password"
 *
 * Copy the printed ADMIN_PASSWORD_HASH into your .env / Vercel env vars.
 */
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error('Usage: npm run seed-admin -- "your-strong-password"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
// Store base64-encoded so the '$' characters in the bcrypt hash survive env loading.
const hashB64 = Buffer.from(hash, "utf8").toString("base64");
const authSecret = randomBytes(48).toString("hex");

console.log("\nAdd these to your .env.local (and Vercel project env vars):\n");
console.log(`ADMIN_PASSWORD_HASH=${hashB64}`);
console.log(`AUTH_SECRET=${authSecret}`);
console.log(
  "\n(The hash is base64-encoded so it survives env parsing. Keep ADMIN_USERNAME in"
);
console.log("sync with what you'll type at /admin/login.)\n");
