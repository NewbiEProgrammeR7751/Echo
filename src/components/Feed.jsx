import { useCallback, useEffect, useState } from "react";
import { listLatestPosts } from "@/lib/posts";

function formatWhen(ts) {
  try {
    const date =
      typeof ts?.toDate === "function"
        ? ts.toDate()
        : ts instanceof Date
          ? ts
          : null;
    if (!date) return "";
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "";
  }
}

export default function Feed({ refreshToken = 0 }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const items = await listLatestPosts({ max: 50 });
      setPosts(items);
    } catch (err) {
      setError(err?.message ?? "Could not load posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshToken]);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Latest</h2>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80 hover:bg-white/5"
        >
          Refresh
        </button>
      </div>

      {loading ? <div className="mt-3 text-sm text-white/60">Loading…</div> : null}
      {error ? (
        <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {!loading && !error && posts.length === 0 ? (
        <div className="mt-3 text-sm text-white/60">No posts yet. Be the first.</div>
      ) : null}

      <div className="mt-4 flex flex-col gap-3">
        {posts.map((p) => (
          <article key={p.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="flex items-baseline justify-between gap-3">
              <div className="text-sm font-semibold text-white/90">{p.authorName ?? "Anonymous"}</div>
              <div className="text-xs text-white/50">{formatWhen(p.createdAt)}</div>
            </div>
            <div className="mt-2 whitespace-pre-wrap break-words text-sm text-white/85">{p.text}</div>
          </article>
        ))}
      </div>
    </div>
  );
}

