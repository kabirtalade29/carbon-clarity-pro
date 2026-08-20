// Auth attacher for TanStack Start client-side function middleware.
// Since we use HTTP-only session cookies (automatically sent by the browser),
// this middleware simply ensures credentials are included — much simpler
// than the old Supabase bearer-token approach.
import { createMiddleware } from "@tanstack/react-start";

export const attachAuth = createMiddleware({ type: "function" }).client(async ({ next }) => {
  // Cookies are automatically sent with same-origin requests.
  // No explicit header attachment needed — just pass through.
  return next({});
});
