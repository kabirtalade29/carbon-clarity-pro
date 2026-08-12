import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (typeof window !== "undefined" && localStorage.getItem("demo_user_session") === "true") {
      return { user: { id: "demo-user-id", email: "demo@climateintel.ai" } };
    }
    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        return { user: data.user };
      }
    } catch {
      // ignore Supabase network/offline error
    }
    // Default to demo session if Supabase is offline or not signed in
    if (typeof window !== "undefined") {
      localStorage.setItem("demo_user_session", "true");
    }
    return { user: { id: "demo-user-id", email: "demo@climateintel.ai" } };
  },
  component: () => <Outlet />,
});
