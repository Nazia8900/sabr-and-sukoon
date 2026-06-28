import { NextRequest, NextResponse } from "next/server";
import {
  verifyCredentials,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
  const { username = "", password = "" } = body;
  if (!username || !password) {
    return NextResponse.json(
      { ok: false, error: "Username and password required" },
      { status: 400 }
    );
  }
  const ok = await verifyCredentials(username, password);
  if (!ok) {
    return NextResponse.json(
      { ok: false, error: "Invalid credentials" },
      { status: 401 }
    );
  }
  const token = await createSessionToken(username);
  await setSessionCookie(token);
  return NextResponse.json({ ok: true });
}
