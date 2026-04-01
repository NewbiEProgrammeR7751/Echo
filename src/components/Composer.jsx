import { useMemo, useState } from "react";
import { createPost } from "@/lib/posts";
import { useAuth } from "@/auth/AuthProvider";
import { useGeolocation } from "@/hooks/useGeolocation";

export default function Composer({ onPosted }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [attachLocation, setAttachLocation] = useState(true);
  const geo = useGeolocation();

  const remaining = useMemo(() => 280 - text.length, [text.length]);
  const canPost = !!user && text.trim().length > 0 && remaining >= 0 && !submitting;

  async function onSubmit(e) {
    e.preventDefault();
    if (!canPost) return;
    setSubmitting(true);
    setError("");
    try {
      let location = null;
      if (attachLocation) {
        location = geo.position ?? (await geo.refresh());
        if (location) location = { lat: location.lat, lng: location.lng };
      }

      await createPost({ text, author: user, location });
      setText("");
      onPosted?.();
    } catch (err) {
      setError(err?.message ?? "Could not post. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Create post</h2>
        <span className={["text-xs", remaining < 0 ? "text-red-300" : "text-white/60"].join(" ")}>
          {remaining}
        </span>
      </div>

      <form className="mt-3 flex flex-col gap-3" onSubmit={onSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder={user ? "What’s happening?" : "Sign in to post."}
          disabled={!user}
          className="w-full resize-none rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-60"
        />

        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={attachLocation}
              onChange={(e) => setAttachLocation(e.target.checked)}
              className="h-4 w-4 accent-white"
              disabled={!user || submitting}
            />
            Attach location
          </label>

          {attachLocation ? (
            <button
              type="button"
              onClick={() => void geo.refresh()}
              className="rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80 hover:bg-white/5 disabled:opacity-50"
              disabled={!user || submitting || geo.loading}
              title={geo.error || ""}
            >
              {geo.loading ? "Locating…" : geo.position ? "Update location" : "Get location"}
            </button>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80 hover:bg-white/5 disabled:opacity-50"
            onClick={() => setText("")}
            disabled={!user || !text.length || submitting}
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={!canPost}
            className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {submitting ? "Posting…" : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}

