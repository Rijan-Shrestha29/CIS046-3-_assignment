'use client';

// Home page — verifies frontend↔backend interoperability
// Themes:
//  - Interoperability: fetch JSON over HTTP from a separate service
//  - Event-Driven: button click → async fetch → state update → re-render
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Home() {
  const [health, setHealth]   = useState(null);
  const [ping, setPing]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const testBackend = async () => {
    setLoading(true);
    setError(null);
    try {
      const [h, p] = await Promise.all([
        fetch(`${API}/api/health`).then((r) => r.json()),
        fetch(`${API}/api/ping`, { credentials: 'include' }).then((r) => r.json()),
      ]);
      setHealth(h);
      setPing(p);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const allGood = health && ping;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold tracking-tight">
          <span className="text-banana">🍌</span> Banana Game
        </h1>
        <p className="text-muted mt-2 text-sm">
          Project setup test — frontend ↔ backend connectivity
        </p>
      </div>

      <div className="w-full max-w-lg bg-surface border border-border rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-1">Backend Check</h2>
        <p className="text-muted text-sm mb-4">
          API URL: <code className="text-banana">{API}</code>
        </p>

        <button
          onClick={testBackend}
          disabled={loading}
          className="w-full bg-banana hover:bg-banana-dark disabled:opacity-50
                     text-black font-semibold py-2.5 rounded-lg transition-colors"
        >
          {loading ? 'Testing…' : 'Test Backend Connection'}
        </button>

        {error && (
          <div className="mt-4 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            ❌ {error}
          </div>
        )}

        {health && (
          <pre className="mt-4 bg-black/40 border border-border rounded-lg p-3
                          text-xs overflow-auto text-green-300">
{JSON.stringify(health, null, 2)}
          </pre>
        )}

        {ping && (
          <pre className="mt-2 bg-black/40 border border-border rounded-lg p-3
                          text-xs overflow-auto text-green-300">
{JSON.stringify(ping, null, 2)}
          </pre>
        )}

        {allGood && (
          <p className="mt-4 text-green-400 text-sm text-center font-medium">
            ✅ Frontend ↔ Backend interoperability verified
          </p>
        )}
      </div>

      <footer className="mt-12 text-muted text-xs text-center">
        CIS046-3 — Software for Enterprise
      </footer>
    </main>
  );
}