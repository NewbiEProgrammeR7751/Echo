import { useMemo, useState } from "react";
import AuthCard from "@/components/AuthCard";
import Composer from "@/components/Composer";
import Feed from "@/components/Feed";
import MapView from "@/components/MapView";
import { useAuth } from "@/auth/AuthProvider";

export default function App() {
  const { user, initializing, signOut } = useAuth();
  const [refreshToken, setRefreshToken] = useState(0);
  const [tab, setTab] = useState("feed"); // feed | map

  const title = useMemo(() => "Echo", []);

  return (
    <div className="min-h-full bg-[#0A0A0F] text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-sm text-white/70">
              MVP social feed using Firebase Auth + Firestore.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            {user ? (
              <>
                <div className="text-right text-xs text-white/60">
                  Signed in as{" "}
                  <span className="text-white/80">
                    {user.displayName ?? user.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80 hover:bg-white/5"
                >
                  Sign out
                </button>
              </>
            ) : null}
          </div>
        </header>

        {initializing ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            Loading…
          </div>
        ) : user ? null : (
          <AuthCard />
        )}

        <div className="flex flex-wrap gap-2">
          {[
            ["feed", "Feed"],
            ["map", "Map"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={[
                "rounded-full px-3 py-2 text-sm transition",
                tab === key
                  ? "bg-white text-black"
                  : "bg-white/10 text-white hover:bg-white/15",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>

        <Composer onPosted={() => setRefreshToken((x) => x + 1)} />

        {tab === "map" ? <MapView /> : <Feed refreshToken={refreshToken} />}

        <footer className="text-xs text-white/50">
          If you see a permissions error, update your Firestore rules to allow
          authenticated reads/writes to `posts` for MVP.
        </footer>
      </div>
    </div>
  );
}
