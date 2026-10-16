'use client';

// Profile page — personal stats + game history.
// Requires login; redirects to /login?redirect=/profile if anonymous.
//
// Theme: Virtual Identity — this page is meaningful only in the context
// of an authenticated session. Every backend call here is auth-protected
// and goes through the httpOnly cookie.
//
// Theme: Interoperability — pulls from /api/scores/me (paginated) and
// /api/scores/me/highscore (aggregate), both already public API contracts.
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { scoreApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const PAGE_SIZE = 10;

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [summary, setSummary]     = useState(null);
  const [history, setHistory]     = useState(null);   // { total, page, pageSize, pages, scores }
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // Redirect anonymous users — inside useEffect, never during render
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent('/profile')}`);
    }
  }, [authLoading, user, router]);

  const load = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const [sum, hist] = await Promise.all([
        scoreApi.myHighScore(),
        scoreApi.myScores(targetPage, PAGE_SIZE),
      ]);
      setSummary(sum);
      setHistory(hist);
      setPage(targetPage);
    } catch (err) {
      if (err.status === 401) {
        // Session expired mid-visit — bounce to login
        router.replace(`/login?redirect=${encodeURIComponent('/profile')}`);
      } else {
        setError(err.message || 'Could not load profile');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Load once authenticated
  useEffect(() => {
    if (user) load(1);
  }, [user, load]);

  // While redirecting or hydrating, show a minimal placeholder
  if (authLoading || !user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-muted">
        Loading…
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* User card */}
      <section className="bg-surface border border-border rounded-2xl p-6 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-banana text-black text-2xl font-bold
                        flex items-center justify-center shrink-0">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">{user.username}</h1>
          <p className="text-sm text-muted">
            Member since {formatDate(user.createdAt, { dateOnly: true })}
          </p>
        </div>
        <Link
          href="/play"
          className="hidden sm:inline-block px-4 py-2 rounded-lg bg-banana text-black
                     font-semibold hover:bg-banana-dark"
        >
          Play a game
        </Link>
      </section>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30
                        rounded-lg p-3 mb-6 text-center">
          {error}
          <button onClick={() => load(page)} className="ml-3 underline">Retry</button>
        </div>
      )}

      {/* Stats strip */}
      {summary && (
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Stat label="High score"    value={summary.highScore}    accent />
          <Stat label="Total games"   value={summary.gamesPlayed} />
          <Stat label="Average score" value={summary.averageScore} />
          <Stat label="Total points"  value={summary.totalPoints} />
        </section>
      )}

      {/* History header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Game history</h2>
        {history && history.total > 0 && (
          <span className="text-xs text-muted">
            {history.total} {history.total === 1 ? 'record' : 'records'}
          </span>
        )}
      </div>

      {/* History body */}
      {loading && !history && <HistorySkeleton />}

      {!loading && history && history.scores.length === 0 && (
        <EmptyState />
      )}

      {history && history.scores.length > 0 && (
        <>
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="text-xs uppercase text-muted bg-black/20">
                <tr>
                  <th className="px-4 py-3 w-16">#</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3 text-right">Played</th>
                </tr>
              </thead>
              <tbody>
                {history.scores.map((s, i) => (
                  <tr key={s.id} className="border-t border-border hover:bg-surface-2">
                    <td className="px-4 py-3 text-muted font-mono">
                      {(history.page - 1) * history.pageSize + i + 1}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-banana">
                      {s.score}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-muted">
                      {formatDate(s.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {history.pages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <button
                onClick={() => load(page - 1)}
                disabled={page <= 1 || loading}
                className="px-3 py-1.5 rounded-md border border-border
                           hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              <span className="text-muted">
                Page {history.page} of {history.pages}
              </span>
              <button
                onClick={() => load(page + 1)}
                disabled={page >= history.pages || loading}
                className="px-3 py-1.5 rounded-md border border-border
                           hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Footer CTA */}
      <div className="mt-10 text-center">
        <Link
          href="/leaderboard"
          className="text-sm text-muted hover:text-white underline"
        >
          View the global leaderboard →
        </Link>
      </div>
    </div>
  );
}

// --- Sub-components ---

function Stat({ label, value, accent = false }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-3 text-center">
      <div className={`text-2xl font-bold ${accent ? 'text-banana' : ''}`}>{value}</div>
      <div className="text-xs text-muted mt-0.5">{label}</div>
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden animate-pulse">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="h-14 border-t border-border first:border-t-0" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-surface border border-border rounded-2xl p-10 text-center">
      <div className="text-4xl mb-3">🍌</div>
      <p className="text-muted mb-4">
        No games played yet. Solve some equations to start your history.
      </p>
      <Link
        href="/play"
        className="inline-block px-5 py-2.5 rounded-lg bg-banana text-black
                   font-semibold hover:bg-banana-dark"
      >
        Play your first game
      </Link>
    </div>
  );
}

// --- Date formatting ---
// Formats an ISO timestamp into a locale-friendly string.
// Uses Intl.DateTimeFormat so date/time conventions match the visitor's locale.
function formatDate(iso, { dateOnly = false } = {}) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';

  const date = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);

  if (dateOnly) return date;

  const time = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);

  return `${date} · ${time}`;
}