import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--background)" }}
    >
      {/* Ambient background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.15) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo / wordmark */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg font-bold"
              style={{ background: "var(--accent)" }}
            >
              M
            </div>
            <span
              className="text-2xl font-semibold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Bookmark URL
            </span>
          </div>

          <h1
            className="text-3xl font-semibold tracking-tight mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Your bookmarks,
            <br />
            <span style={{ color: "var(--accent)" }}>always in sync.</span>
          </h1>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Save links privately. Access them anywhere.
            <br />
            Updates across all your tabs in real time.
          </p>
        </div>

        {/* Login card */}
        <div
          className="rounded-2xl p-6 border"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <form action="/auth/google" method="GET">
            <GoogleSignInButton />
          </form>

          <p
            className="text-xs text-center mt-4"
            style={{ color: "var(--text-secondary)" }}
          >
            No password required. Only your Google account.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {["🔒 Private", "⚡ Real-time", "🗑️ Full control"].map((f) => (
            <span
              key={f}
              className="text-xs px-3 py-1 rounded-full border"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}

function GoogleSignInButton() {
  // This is a client action — we use a Server Action to trigger the OAuth flow
  return (
    <a
      href="/auth/google"
      className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl font-medium text-sm transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
      style={{
        background: "white",
        color: "#1a1a1a",
      }}
    >
      {/* Google G icon */}
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
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
      Continue with Google
    </a>
  );
}
