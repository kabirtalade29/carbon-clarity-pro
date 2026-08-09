// Server-only auth route handlers for Google OAuth.
// These are called from src/server.ts before TanStack Start processes the request.

import {
  createSessionToken,
  verifySessionToken,
  getSessionFromCookies,
  makeSessionCookieHeader,
  clearSessionCookieHeader,
} from "./session.server";

const GOOGLE_CLIENT_ID = () =>
  process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = () =>
  process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REDIRECT_URI = () =>
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:8080/api/auth/callback";

type GoogleTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type GoogleUserInfo = {
  sub: string;
  email: string;
  name: string;
  picture: string;
};

/**
 * Main router — returns a Response if the path matches an auth route,
 * or null to let TanStack Start handle it.
 */
export async function handleAuthRoute(
  request: Request,
): Promise<Response | null> {
  const url = new URL(request.url);

  if (url.pathname === "/api/auth/login" && request.method === "GET") {
    return handleLogin();
  }
  if (url.pathname === "/api/auth/callback" && request.method === "GET") {
    return handleCallback(url);
  }
  if (url.pathname === "/api/me" && request.method === "GET") {
    return handleMe(request);
  }
  if (url.pathname === "/api/auth/logout" && request.method === "POST") {
    return handleLogout();
  }

  return null;
}

// ─── GET /api/auth/login ────────────────────────────────────────────────────

function handleLogin(): Response {
  const clientId = GOOGLE_CLIENT_ID();
  const redirectUri = GOOGLE_REDIRECT_URI();

  if (!clientId) {
    console.error("[auth] GOOGLE_CLIENT_ID is not set");
    return new Response("Server misconfigured: missing GOOGLE_CLIENT_ID", {
      status: 500,
    });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
    },
  });
}

// ─── GET /api/auth/callback?code=... ────────────────────────────────────────

async function handleCallback(url: URL): Promise<Response> {
  const code = url.searchParams.get("code");
  if (!code) {
    return new Response("Missing authorization code", { status: 400 });
  }

  const clientId = GOOGLE_CLIENT_ID();
  const clientSecret = GOOGLE_CLIENT_SECRET();
  const redirectUri = GOOGLE_REDIRECT_URI();

  // 1. Exchange authorization code for tokens
  let tokens: GoogleTokenResponse;
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const body = await tokenRes.text();
      console.error("[auth] Token exchange failed:", body);
      return new Response("Authentication failed during token exchange", {
        status: 500,
      });
    }

    tokens = (await tokenRes.json()) as GoogleTokenResponse;
  } catch (err) {
    console.error("[auth] Token exchange request error:", err);
    return new Response("Authentication failed", { status: 500 });
  }

  // 2. Fetch user info from Google
  let googleUser: GoogleUserInfo;
  try {
    const userRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      },
    );

    if (!userRes.ok) {
      console.error("[auth] User info fetch failed:", await userRes.text());
      return new Response("Failed to fetch user info from Google", {
        status: 500,
      });
    }

    googleUser = (await userRes.json()) as GoogleUserInfo;
  } catch (err) {
    console.error("[auth] User info request error:", err);
    return new Response("Failed to fetch user info", { status: 500 });
  }

  // 3. Create signed session token
  const sessionToken = await createSessionToken({
    id: googleUser.sub,
    email: googleUser.email,
    name: googleUser.name,
    picture: googleUser.picture,
  });

  // 4. Redirect to dashboard with session cookie
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/dashboard",
      "Set-Cookie": makeSessionCookieHeader(sessionToken),
    },
  });
}

// ─── GET /api/me ────────────────────────────────────────────────────────────

async function handleMe(request: Request): Promise<Response> {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = getSessionFromCookies(cookieHeader);

  if (!token) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await verifySessionToken(token);
  if (!user) {
    return Response.json({ error: "Session expired or invalid" }, { status: 401 });
  }

  return Response.json(user);
}

// ─── POST /api/auth/logout ──────────────────────────────────────────────────

function handleLogout(): Response {
  return Response.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": clearSessionCookieHeader(),
      },
    },
  );
}
