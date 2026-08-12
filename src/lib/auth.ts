// Frontend auth module — replaces Supabase auth.
// Talks to the server-side auth routes via /api/* endpoints (same origin).

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture: string;
};

let _cachedUser: AuthUser | null | undefined;

/**
 * Fetch the currently signed-in user from the auth backend.
 * Returns `null` if not authenticated.
 */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  // Return cached result if available (cleared on logout / page reload)
  if (_cachedUser !== undefined) return _cachedUser;

  try {
    const res = await fetch("/api/me", { credentials: "include" });
    if (!res.ok) {
      _cachedUser = null;
      return null;
    }
    const user: AuthUser = await res.json();
    _cachedUser = user;
    return user;
  } catch {
    _cachedUser = null;
    return null;
  }
}

/**
 * Returns true if the user has a valid session.
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await fetchCurrentUser();
  return user !== null;
}

/**
 * Require authentication — throws an error if not signed in.
 * Use this as a guard in processing functions (PDF generation, etc.)
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await fetchCurrentUser();
  if (!user) {
    throw new Error("Authentication required. Please sign in to continue.");
  }
  return user;
}

/**
 * Sign out the current user by calling the backend logout endpoint
 * and clearing the cached user.
 */
export async function logout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // Ignore network errors during logout
  }
  _cachedUser = undefined;
}

/**
 * Clear the cached user (call after navigation or when auth state may change).
 */
export function clearAuthCache(): void {
  _cachedUser = undefined;
}
