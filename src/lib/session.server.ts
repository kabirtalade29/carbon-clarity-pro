// Server-only session utilities.
// Uses HMAC-signed cookies for stateless session management.
// The session token format is: base64url(json_payload).hex(hmac_signature)

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  picture: string;
  exp?: number;
  iat?: number;
};

const DEFAULT_DEV_SECRET = "carbonly-dev-secret-change-in-production";
const COOKIE_NAME = "carbonly_session";
const OAUTH_STATE_COOKIE = "carbonly_oauth_state";
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

const encoder = new TextEncoder();

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  const isProd =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production" ||
    process.env.VERCEL === "1";

  if (!secret || secret === DEFAULT_DEV_SECRET) {
    if (isProd) {
      throw new Error(
        "CRITICAL SECURITY CONFIGURATION ERROR: SESSION_SECRET is missing or set to the default dev secret. Configure a strong random SESSION_SECRET in your Vercel project environment variables.",
      );
    }
    return DEFAULT_DEV_SECRET;
  }
  return secret;
}

async function getSigningKey(): Promise<CryptoKey> {
  const secret = getSessionSecret();
  return await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
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
 * Convert arbitrary string identity (e.g. Google sub) into a deterministic, valid RFC 4122 UUID.
 */
export async function toDeterministicUuid(input: string): Promise<string> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(input)) return input.toLowerCase();

  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(`google-sub:${input}`));
  const bytes = new Uint8Array(hashBuffer).slice(0, 16);
  // Set version 5 (or 4 format)
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  // Set variant to RFC 4122 (10xxxxxx)
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Create a signed session token from user info with embedded timestamps.
 */
export async function createSessionToken(user: Omit<SessionUser, "exp" | "iat">): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payloadData: SessionUser = {
    ...user,
    iat: now,
    exp: now + MAX_AGE_SECONDS,
  };
  const jsonStr = JSON.stringify(payloadData);
  // UTF-8 safe base64 encoding
  const payload = btoa(unescape(encodeURIComponent(jsonStr)));
  const key = await getSigningKey();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${payload}.${bufToHex(sig)}`;
}

/**
 * Verify and decode a session token. Returns null if invalid, expired, or tampered.
 * Uses timing-safe comparison via crypto.subtle.verify.
 */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
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

    const rawJson = decodeURIComponent(escape(atob(payload)));
    const parsed = JSON.parse(rawJson) as Partial<SessionUser>;

    // Structural validation
    if (!parsed || typeof parsed.id !== "string" || typeof parsed.email !== "string") {
      return null;
    }

    // Check expiration if present
    const now = Math.floor(Date.now() / 1000);
    if (typeof parsed.exp === "number" && parsed.exp < now) {
      return null;
    }

    return {
      id: parsed.id,
      email: parsed.email,
      name: parsed.name ?? "",
      picture: parsed.picture ?? "",
      exp: parsed.exp,
      iat: parsed.iat,
    };
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

function isSecureEnvironment(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    process.env.VERCEL_ENV !== undefined
  );
}

/**
 * Build the Set-Cookie header value to create a session cookie.
 */
export function makeSessionCookieHeader(token: string): string {
  const secureFlag = isSecureEnvironment() ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}${secureFlag}`;
}

/**
 * Build the Set-Cookie header value to clear the session cookie.
 */
export function clearSessionCookieHeader(): string {
  const secureFlag = isSecureEnvironment() ? "; Secure" : "";
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureFlag}`;
}

/**
 * Build OAuth state cookie header for CSRF mitigation.
 */
export function makeOAuthStateCookie(state: string): string {
  const secureFlag = isSecureEnvironment() ? "; Secure" : "";
  return `${OAUTH_STATE_COOKIE}=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${secureFlag}`;
}

/**
 * Clear OAuth state cookie header.
 */
export function clearOAuthStateCookie(): string {
  const secureFlag = isSecureEnvironment() ? "; Secure" : "";
  return `${OAUTH_STATE_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureFlag}`;
}

/**
 * Extract OAuth state token from cookies.
 */
export function getOAuthStateFromCookies(cookieHeader: string): string | null {
  return parseCookies(cookieHeader)[OAUTH_STATE_COOKIE] || null;
}
