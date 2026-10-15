"use client";

// Login + register page.
// Theme: Virtual Identity — client-side identity establishment.
//
// Note: useSearchParams() forces the route to be dynamic (it reads the URL
// at request time). Next.js requires such a hook to be inside a <Suspense>
// boundary so the shell can still be prerendered. We split the page into a
// Suspense wrapper + the actual form for that reason.
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// --- Public page (Suspense wrapper) ---
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginSkeleton() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-8 opacity-30">Log in</h1>
      <div className="bg-surface border border-border rounded-2xl p-6 h-80 animate-pulse" />
    </div>
  );
}

// --- The actual form (uses useSearchParams) ---
function LoginForm() {
  const { user, login, register } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/";

  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // If already logged in, bounce to redirect target
  useEffect(() => {
    if (user) router.replace(redirect);
  }, [user, redirect, router]);

  if (user) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") await login(username, password);
      else await register(username, password);
      router.push(redirect);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-2">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="text-center text-muted text-sm mb-8">
        {mode === "login"
          ? "Log in to save scores and challenge friends."
          : "Sign up to appear on the leaderboard."}
      </p>

      {/* Tab toggle — more obvious than a text link */}
      <div className="flex bg-surface border border-border rounded-xl p-1 mb-4">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError(null);
          }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            mode === "login"
              ? "bg-banana text-black"
              : "text-muted hover:text-white"
          }`}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError(null);
          }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            mode === "register"
              ? "bg-banana text-black"
              : "text-muted hover:text-white"
          }`}
        >
          Register
        </button>
      </div>

      <form
        onSubmit={onSubmit}
        className="bg-surface border border-border rounded-2xl p-6 space-y-4"
      >
        <div>
          <label className="text-sm text-muted block mb-1">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            autoComplete="username"
            className="w-full px-3 py-2 rounded-lg bg-bg border border-border focus:border-banana outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-muted block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            className="w-full px-3 py-2 rounded-lg bg-bg border border-border focus:border-banana outline-none"
          />
          {mode === "register" && (
            <p className="text-xs text-muted mt-1">At least 6 characters</p>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full py-2.5 rounded-lg bg-banana text-black font-semibold hover:bg-banana-dark disabled:opacity-50"
        >
          {busy
            ? "Please wait…"
            : mode === "login"
              ? "Log in"
              : "Create account"}
        </button>
      </form>
    </div>
  );
}
