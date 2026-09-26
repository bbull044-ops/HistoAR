import { createHmac, timingSafeEqual } from "node:crypto";

export const EXPORT_SESSION_COOKIE = "histoar_export_session";
const SESSION_MAX_AGE = 60 * 60 * 8;

function secret(): string {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) throw new Error("SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi.");
  return value;
}

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createExportSession(username: string): string {
  const payload = encode(JSON.stringify({
    username,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  }));
  return `${payload}.${sign(payload)}`;
}

export function verifyExportSession(token: string | null): { username: string } | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      username?: string;
      exp?: number;
    };
    if (!data.username || !data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    return { username: data.username };
  } catch {
    return null;
  }
}

export function getExportSessionFromRequest(request: Request) {
  const header = request.headers.get("cookie") ?? "";
  const match = header.match(new RegExp(`(?:^|;\\s*)${EXPORT_SESSION_COOKIE}=([^;]+)`));
  return verifyExportSession(match?.[1] ?? null);
}

export function exportSessionCookie(token: string, maxAge = SESSION_MAX_AGE) {
  return `${EXPORT_SESSION_COOKIE}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}
