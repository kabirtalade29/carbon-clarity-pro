// Server-only session utilities.
// Uses HMAC-signed cookies for stateless session management.
// The session token format is: base64url(json_payload).hex(hmac_signature)

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  picture: string;
};

const SESSION_SECRET =
  process.env.SESSION_SECRET || "carbonly-dev-secret-change-in-production";
const COOKIE_NAME = "carbonly_session";
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

const encoder = new TextEncoder();
let _cachedKey: CryptoKey | null = null;

async function getSigningKey(): Promise<CryptoKey> {
  if (_cachedKey) return _cachedKey;
  _cachedKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  return _cachedKey;
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Create a signed session token from user info.
 */
export async function createSessionToken(user: SessionUser): Promise<string> {
  const payload = btoa(JSON.stringify(user));
  const key = await getSigningKey();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${payload}.${bufToHex(sig)}`;
}

/**
 * Verify and decode a session token. Returns null if invalid or tampered.
 * Uses timing-safe comparison via crypto.subtle.verify.
 */
export async function verifySessionToken(
  token: string,
): Promise<SessionUser | null> {
  const dotIdx = token.lastIndexOf(".");
  if (dotIdx === -1) return null;

  const payload = token.substring(0, dotIdx);
  const sigHex = token.substring(dotIdx + 1);
  if (!payload || !sigHex || sigHex.length !== 64) return null;

  try {
    const key = await getSigningKey();
    const sigBytes = hexToBuf(sigHex);
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes.buffer as ArrayBuffer,
      encoder.encode(payload),
    );
    if (!isValid) return null;
    return JSON.parse(atob(payload)) as SessionUser;
  } catch {
    return null;
  }
}

/**
 * Parse cookies from a Cookie header string.
 */
export function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  for (const pair of cookieHeader.split(";")) {
    const eqIdx = pair.indexOf("=");
    if (eqIdx === -1) continue;
    const key = pair.substring(0, eqIdx).trim();
    const value = pair.substring(eqIdx + 1).trim();
    if (key) cookies[key] = value;
  }
  return cookies;
}

/**
 * Extract the session token from a Cookie header.
 */
export function getSessionFromCookies(cookieHeader: string): string | null {
  return parseCookies(cookieHeader)[COOKIE_NAME] || null;
}

/**
 * Build the Set-Cookie header value to create a session cookie.
 */
export function makeSessionCookieHeader(token: string): string {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}`;
}

/**
 * Build the Set-Cookie header value to clear the session cookie.
 */
export function clearSessionCookieHeader(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
