"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Bookmark {
  id: string;
  user_id: string;
  url: string;
  title: string;
  created_at: string;
}

interface Props {
  userId: string;
  initialBookmarks: Bookmark[];
}

export default function BookmarksClient({ userId, initialBookmarks }: Props) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [liveIndicator, setLiveIndicator] = useState(false);
  const supabase = useRef(createClient());
  const flashTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Flash the live indicator when realtime fires
  const flashLive = useCallback(() => {
    setLiveIndicator(true);
    if (flashTimeout.current) clearTimeout(flashTimeout.current);
    flashTimeout.current = setTimeout(() => setLiveIndicator(false), 1500);
  }, []);

  // Set up Supabase Realtime subscription
  useEffect(() => {
    const client = supabase.current;

    const channel = client
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          flashLive();

          if (payload.eventType === "INSERT") {
            const newBookmark = payload.new as Bookmark;
            setBookmarks((prev) => {
              // Avoid duplicates if we added it ourselves
              if (prev.some((b) => b.id === newBookmark.id)) return prev;
              return [newBookmark, ...prev];
            });
          } else if (payload.eventType === "DELETE") {
            setBookmarks((prev) =>
              prev.filter((b) => b.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [userId, flashLive]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedUrl = url.trim();
    const trimmedTitle = title.trim();

    if (!trimmedUrl) return setError("URL is required.");
    if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
      return setError('URL must start with "http://" or "https://".');
    }

    setAdding(true);

    const { data, error: insertError } = await supabase.current
      .from("bookmarks")
      .insert({
        user_id: userId,
        url: trimmedUrl,
        title: trimmedTitle || new URL(trimmedUrl).hostname,
      })
      .select()
      .single();

    setAdding(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    if (data) {
      // Optimistically add it (realtime will dedup)
      setBookmarks((prev) => {
        if (prev.some((b) => b.id === data.id)) return prev;
        return [data, ...prev];
      });
    }

    setUrl("");
    setTitle("");
  }

  async function handleDelete(id: string) {
    setDeletingId(id);

    // Optimistically remove
    setBookmarks((prev) => prev.filter((b) => b.id !== id));

    const { error: deleteError } = await supabase.current
      .from("bookmarks")
      .delete()
      .eq("id", id);

    setDeletingId(null);

    if (deleteError) {
      // Roll back on error
      const { data } = await supabase.current
        .from("bookmarks")
        .select("*")
        .eq("id", id)
        .single();
      if (data) {
        setBookmarks((prev) => [data, ...prev]);
      }
      setError(deleteError.message);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function getDomain(rawUrl: string) {
    try {
      return new URL(rawUrl).hostname.replace(/^www\./, "");
    } catch {
      return rawUrl;
    }
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-xl font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Your Bookmarks
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {bookmarks.length === 0
              ? "No bookmarks yet — add your first below."
              : `${bookmarks.length} bookmark${bookmarks.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: liveIndicator ? "#22c55e" : "var(--border)",
              boxShadow: liveIndicator ? "0 0 6px #22c55e" : "none",
            }}
          />
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Live
          </span>
        </div>
      </div>

      {/* Add Bookmark Form */}
      <form
        onSubmit={handleAdd}
        className="rounded-2xl border p-4 space-y-3"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <p
          className="text-xs font-medium uppercase tracking-widest"
          style={{ color: "var(--text-secondary)" }}
        >
          Add Bookmark
        </p>

        <div className="space-y-2">
          <input
            type="text"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border transition-all focus:border-indigo-500"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
            autoComplete="off"
          />
          <input
            type="text"
            placeholder="Title (optional — defaults to domain)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border transition-all focus:border-indigo-500"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
            autoComplete="off"
          />
        </div>

        {error && (
          <p className="text-xs" style={{ color: "var(--danger)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={adding}
          className="w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          style={{
            background: "var(--accent)",
            color: "white",
          }}
        >
          {adding ? "Saving…" : "Save Bookmark"}
        </button>
      </form>

      {/* Bookmark list */}
      {bookmarks.length > 0 ? (
        <ul className="space-y-2">
          {bookmarks.map((bm) => (
            <li
              key={bm.id}
              className="group flex items-start gap-3 rounded-xl border px-4 py-3 transition-all hover:border-indigo-500/40"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                opacity: deletingId === bm.id ? 0.4 : 1,
              }}
            >
              {/* Favicon */}
              <img
                src={`https://www.google.com/s2/favicons?domain=${getDomain(bm.url)}&sz=32`}
                alt=""
                width={16}
                height={16}
                className="rounded mt-0.5 flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <a
                  href={bm.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-sm leading-snug block truncate transition-colors hover:text-indigo-400"
                  style={{ color: "var(--text-primary)" }}
                >
                  {bm.title}
                </a>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="text-xs truncate"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {getDomain(bm.url)}
                  </span>
                  <span style={{ color: "var(--border)" }}>·</span>
                  <span
                    className="text-xs flex-shrink-0"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {formatDate(bm.created_at)}
                  </span>
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(bm.id)}
                disabled={deletingId === bm.id}
                aria-label="Delete bookmark"
                className="flex-shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 disabled:cursor-not-allowed"
                style={{ color: "var(--danger)" }}
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div
          className="rounded-2xl border border-dashed p-10 text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-3xl mb-3">🔖</p>
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            No bookmarks yet
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            Add your first bookmark using the form above.
          </p>
        </div>
      )}
    </div>
  );
}

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}
