import { useMemo, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";

function friendlyAuthErrorMessage(error) {
  const code = error?.code ?? "";
  if (code === "auth/invalid-email") return "That email address looks invalid.";
  if (code === "auth/email-already-in-use") return "That email is already in use.";
  if (code === "auth/weak-password") return "Password is too weak (try 6+ characters).";
  if (code === "auth/invalid-credential") return "Email or password is incorrect.";
  if (code === "auth/too-many-requests")
    return "Too many attempts. Please wait a bit and try again.";
  return error?.message ?? "Something went wrong.";
}

export default function AuthCard() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    if (!email.trim() || !password) return false;
    if (mode === "signup" && !displayName.trim()) return false;
    return true;
  }, [email, password, displayName, mode]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError("");

    try {
      if (mode === "signup") {
        await signUp({ email: email.trim(), password, displayName: displayName.trim() });
      } else {
        await signIn({ email: email.trim(), password });
      }
    } catch (err) {
      setError(friendlyAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">
          {mode === "signup" ? "Create account" : "Sign in"}
        </h2>
        <button
          type="button"
          className="rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80 hover:bg-white/5"
          onClick={() => {
            setError("");
            setMode((m) => (m === "signup" ? "signin" : "signup"));
          }}
        >
          {mode === "signup" ? "Have an account?" : "New here?"}
        </button>
      </div>

      <form className="mt-4 flex flex-col gap-3" onSubmit={onSubmit}>
        {mode === "signup" ? (
          <label className="text-sm text-white/80">
            Display name
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="Rudy"
              autoComplete="nickname"
            />
          </label>
        ) : null}

        <label className="text-sm text-white/80">
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
          />
        </label>

        <label className="text-sm text-white/80">
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            placeholder="••••••••"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />
        </label>

        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black disabled:opacity-50"
        >
          {submitting ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

