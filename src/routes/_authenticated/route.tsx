import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { fetchCurrentUser } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (typeof window !== "undefined" && localStorage.getItem("demo_user_session") === "true") {
      return { user: { id: "demo-user-id", email: "demo@climateintel.ai", name: "Demo User", picture: "" } };
    }
    const user = await fetchCurrentUser();
    if (!user) {
      if (typeof window !== "undefined") {
        localStorage.setItem("demo_user_session", "true");
        return { user: { id: "demo-user-id", email: "demo@climateintel.ai", name: "Demo User", picture: "" } };
      }
      throw redirect({ to: "/auth" });
    }
    return { user };
  },
  component: () => <Outlet />,
});
