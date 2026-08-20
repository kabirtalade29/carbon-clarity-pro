import { createFileRoute, redirect } from "@tanstack/react-router";

// The index route redirects to the dashboard.
// The dashboard (under /_authenticated) will handle the auth check.
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "clisomumbai — Enterprise Carbon Emission Calculator" },
      {
        name: "description",
        content:
          "IPCC-grade GHG calculations, live dashboards and audit-ready PDF reports for sustainability teams by Climate Social Mumbai.",
      },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
  component: () => null,
});
