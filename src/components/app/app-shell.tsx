import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Calculator,
  History,
  Shield,
  LogOut,
  Leaf,
  FileText,
  Menu,
  Gauge,
  TrendingDown,
} from "lucide-react";
import { type ReactNode } from "react";
import { logout, clearAuthCache } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { amIAdmin } from "@/lib/calculations.functions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AiCopilotSheet } from "./ai-copilot";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const qc = useQueryClient();
  const { data: adminInfo } = useQuery({
    queryKey: ["me", "admin"],
    queryFn: () => amIAdmin(),
    staleTime: 60_000,
  });

  const nav = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/calculator", label: "Calculator", icon: Calculator },
    { to: "/reports", label: "Report Builder", icon: FileText },
    { to: "/decarbonization", label: "Decarbonization", icon: TrendingDown },
    { to: "/gwp-odp", label: "GWP-ODP Calc", icon: Gauge },
    { to: "/history", label: "History", icon: History },
    ...(adminInfo?.isAdmin ? [{ to: "/admin", label: "Admin", icon: Shield }] : []),
  ] as const;

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    clearAuthCache();
    await logout();
    toast.success("Signed out");
    window.location.href = "/auth";
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Header */}
      <header className="flex h-14 items-center justify-between border-b bg-sidebar px-4 text-sidebar-foreground md:hidden">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <Leaf className="h-4 w-4" />
          </div>
          <span className="font-display text-base">clisomumbai</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-60 bg-sidebar text-sidebar-foreground p-0 flex flex-col"
          >
            <div className="flex items-center gap-2 px-5 py-5 border-b">
              <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
                <Leaf className="h-4 w-4" />
              </div>
              <div>
                <span className="font-display text-lg block leading-none">clisomumbai</span>
                <span className="text-[10px] text-muted-foreground">Climate Social Mumbai</span>
              </div>
            </div>
            <nav className="flex-1 space-y-1 px-3 mt-4">
              {nav.map((n) => {
                const active = pathname.startsWith(n.to);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                    )}
                  >
                    <n.icon className="h-4 w-4" />
                    {n.label}
                  </Link>
                );
              })}
            </nav>
            <div className="px-3 pb-5">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <Leaf className="h-4 w-4" />
          </div>
          <div>
            <span className="font-display text-lg block leading-tight">clisomumbai</span>
            <span className="text-[10px] text-muted-foreground block">Climate Social Mumbai</span>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((n) => {
            const active = pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                )}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 pb-5">
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      <main className="md:pl-60">
        <div className="flex h-14 items-center justify-between border-b px-4 md:px-8 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
              Climate Social Mumbai
            </span>
          </div>
          <div className="flex items-center gap-3">
            <AiCopilotSheet />
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">{children}</div>
      </main>
    </div>
  );
}
