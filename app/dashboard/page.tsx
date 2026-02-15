import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BookmarksClient from "@/components/BookmarksClient";
import Image from "next/image";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Fetch initial bookmarks server-side for instant render
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", { ascending: false });

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const displayName =
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    user.email ||
    "User";

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 100% 40% at 50% -5%, rgba(99,102,241,0.1) 0%, transparent 60%)",
        }}
      />

      {/* Header */}
      <header
        className="sticky top-0 z-10 border-b backdrop-blur-xl"
        style={{
          background: "rgba(10,10,15,0.8)",
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ background: "var(--accent)" }}
            >
              B
            </div>
            <span
              className="font-semibold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Bookmark URL
            </span>
          </div>

          {/* User + sign out */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              ) : (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{
                    background: "var(--accent-subtle)",
                    color: "var(--accent)",
                    border: "1px solid var(--accent)",
                  }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span
                className="text-sm hidden sm:block"
                style={{ color: "var(--text-secondary)" }}
              >
                {displayName.split(" ")[0]}
              </span>
            </div>

            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
                style={{
                  background: "transparent",
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8 relative">
        <BookmarksClient userId={user.id} initialBookmarks={bookmarks ?? []} />
      </main>
    </div>
  );
}
