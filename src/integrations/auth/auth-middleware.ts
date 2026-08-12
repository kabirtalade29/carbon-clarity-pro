// Auth middleware for TanStack Start server functions.
// Validates the session cookie directly using the session module —
// no external HTTP calls needed since auth runs in the same process.
import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import {
  getSessionFromCookies,
  verifySessionToken,
} from "@/lib/session.server";

export const requireAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();
    const cookieHeader = request?.headers?.get("cookie") ?? "";
    const token = getSessionFromCookies(cookieHeader);

    if (!token) {
      throw new Error("Unauthorized: valid session required");
    }

    const user = await verifySessionToken(token);
    if (!user) {
      throw new Error("Unauthorized: session expired or invalid");
    }

    return next({
      context: {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
      },
    });
  },
);
