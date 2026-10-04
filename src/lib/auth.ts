/**
 * Lightweight, dependency-light admin auth.
 *
 * - Single admin account locked to a bcrypt hash in this private application.
 * - On login we verify the bcrypt hash and issue a signed JWT (jose) stored in an
 *   httpOnly, SameSite=Lax cookie. Middleware + server components verify it.
 *
 * This is a "full" auth approach (hashed credentials + signed sessions + guarded
 * routes), without pulling in a heavier auth framework.
 */
import "server-only";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "ss_admin_session";
const MAX_AGE = 60 * 60 * 8; // 8 hours
const ADMIN_USERNAME = "nazia";
const ADMIN_PASSWORD_HASH_B64 = process.env.ADMIN_PASSWORD_HASH ?? "";
const ADMIN_PASSWORD_HASH = Buffer.from(
  ADMIN_PASSWORD_HASH_B64,
  "base64",
).toString("utf8");

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s);
}

export type Session = { sub: string; role: "admin" };

export async function verifyCredentials(
  username: string,
  password: string
): Promise<boolean> {
  if (username.trim().toLowerCase() !== ADMIN_USERNAME) {
    await bcrypt.compare(password, "$2a$10$invalidinvalidinvalidinvalidinvalidinv"); // constant-time-ish
    return false;
  }
  return bcrypt.compare(password, ADMIN_PASSWORD_HASH);
}

export async function createSessionToken(username: string): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(username)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export async function verifySessionToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.role !== "admin" || !payload.sub) return null;
    return { sub: String(payload.sub), role: "admin" };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

/** Read & verify the current session from cookies (server components / route handlers). */
export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export const MAX_AGE_SECONDS = MAX_AGE;
