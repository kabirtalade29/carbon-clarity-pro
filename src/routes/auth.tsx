import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Leaf, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Carbonly" },
      { name: "description", content: "Sign in or create your Carbonly account." },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const fullName = String(fd.get("full_name") ?? "").trim();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
        navigate({ to: "/dashboard" });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/dashboard",
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created — check your email to verify.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        toast.success("Reset link sent to your email.");
        setMode("signin");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden bg-primary text-primary-foreground md:flex md:flex-col md:justify-between md:p-12">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary-foreground text-primary">
            <Leaf className="h-4 w-4" />
          </div>
          <span className="font-display text-xl">Carbonly</span>
        </Link>
        <div>
          <p className="font-display text-4xl leading-tight">
            "The reporting quality doubled overnight."
          </p>
          <p className="mt-4 text-sm text-primary-foreground/70">Sustainability lead, mid-cap manufacturer</p>
        </div>
        <div className="text-xs text-primary-foreground/60">
          IPCC 2006 · GHG Protocol · EPA eGRID
        </div>
      </div>
      <div className="flex flex-col justify-center px-6 py-12 md:px-16">
        <Link to="/" className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground md:hidden">
          <ArrowLeft className="h-3 w-3" /> Home
        </Link>
        <Card className="mx-auto w-full max-w-md rounded-2xl border-border/60 p-8">
          <div className="mb-6">
            <h1 className="font-display text-3xl">
              {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Reset password"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Welcome back to Carbonly."
                : mode === "signup"
                  ? "Start measuring in under a minute."
                  : "We'll email you a reset link."}
            </p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" name="full_name" required maxLength={120} />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required maxLength={200} />
            </div>
            {mode !== "forgot" && (
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required minLength={6} maxLength={200} />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
            </Button>
          </form>
          <div className="mt-6 flex items-center justify-between text-sm">
            {mode !== "signin" ? (
              <button className="text-muted-foreground hover:text-foreground" onClick={() => setMode("signin")}>← Sign in</button>
            ) : (
              <button className="text-muted-foreground hover:text-foreground" onClick={() => setMode("signup")}>Create account</button>
            )}
            {mode === "signin" && (
              <button className="text-muted-foreground hover:text-foreground" onClick={() => setMode("forgot")}>Forgot password?</button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
