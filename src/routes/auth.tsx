import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Leaf, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { fetchCurrentUser } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Carbonly" },
      {
        name: "description",
        content: "Sign in to your Carbonly account with Google.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();

  // If already signed in, redirect to dashboard
  useEffect(() => {
    fetchCurrentUser().then((user) => {
      if (user) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  function handleGoogleSignIn() {
    // Redirect to the Rust auth backend's Google OAuth login endpoint
    window.location.href = "/api/auth/login";
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Left branded panel */}
      <div className="relative hidden bg-primary text-primary-foreground md:flex md:flex-col md:justify-between md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06)_0%,transparent_60%)]" />
        <Link to="/auth" className="relative flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary-foreground text-primary">
            <Leaf className="h-4 w-4" />
          </div>
          <span className="font-display text-xl">Carbonly</span>
        </Link>
        <div className="relative">
          <p className="font-display text-4xl leading-tight">
            "The reporting quality doubled overnight."
          </p>
          <p className="mt-4 text-sm text-primary-foreground/70">
            Sustainability lead, mid-cap manufacturer
          </p>
        </div>
        <div className="relative text-xs text-primary-foreground/60">
          IPCC 2006 · GHG Protocol · EPA eGRID
        </div>
      </div>

      {/* Right sign-in panel */}
      <div className="flex flex-col items-center justify-center px-6 py-12 md:px-16">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 md:hidden">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <Leaf className="h-4 w-4" />
          </div>
          <span className="font-display text-xl">Carbonly</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card className="rounded-2xl border-border/60 p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10">
                <Leaf className="h-7 w-7 text-primary" />
              </div>
              <h1 className="font-display text-3xl">Welcome to Carbonly</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in with your Google account to access your carbon
                accounting workspace.
              </p>
            </div>

            <Button
              size="lg"
              className="w-full gap-3 text-base"
              onClick={handleGoogleSignIn}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </Button>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-accent" />
              <span>IPCC 2006 · GHG Protocol · EPA eGRID</span>
            </div>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By signing in, you agree to Carbonly's terms of service and privacy
            policy. Your data is protected with enterprise-grade security.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
