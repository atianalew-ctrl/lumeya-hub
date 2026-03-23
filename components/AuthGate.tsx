"use client";
import { useState, useEffect } from "react";
import { checkAuth, login } from "@/lib/auth";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    setAuthed(checkAuth());
  }, []);

  if (authed === null) return null;

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="w-full max-w-sm p-8 rounded-2xl shadow-sm border" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
          <div className="mb-8 text-center">
            <div className="w-10 h-10 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--primary)" }}>
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <h1 className="text-xl font-semibold" style={{ color: "var(--foreground)" }}>Lumeya Dev Hub</h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Enter your password to continue</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (login(password)) {
                setAuthed(true);
              } else {
                setError(true);
                setPassword("");
              }
            }}
          >
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Password"
              autoFocus
              className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all mb-3"
              style={{
                borderColor: error ? "#ef4444" : "var(--border)",
                background: "var(--muted)",
                color: "var(--foreground)",
              }}
            />
            {error && <p className="text-xs text-red-500 mb-3">Incorrect password. Try again.</p>}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--primary)" }}
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
