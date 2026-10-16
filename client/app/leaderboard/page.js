'use client';

// Leaderboard — public page.
// Fetches /api/scores/leaderboard (top N by max score per user)
// and /api/scores/stats (global counters).
//
// Theme: Interoperability — this page's contract is entirely the JSON
// shape returned by the Express backend. No server code is duplicated here.
//
// Theme: Event-Driven Programming — auto-refresh every 30s, manual
// refresh, and highlight-your-row are all effects triggered by state.
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { scoreApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const REFRESH_INTERVAL_MS = 30_000;
const TOP_N = 10;

export default function LeaderboardPage() {
  const { user } = useAuth();

  const [rows, setRows]         = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [lb, st] = await Promise.all([
        scoreApi.leaderboard(TOP_N),
        scoreApi.stats(),
      ]);
      setRows(lb.leaderboard);
      setStats(st);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Could not load leaderboard');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => { load(); }, [load]);

  // Auto-refresh
  useEffect(() => {
    const id = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]);

  const podium = rows.slice(0, 3);
  const rest   = rows.slice(3);

  // Highlight the current user's row if present anywhere in the board
  const myRank = useMemo(
    () => (user ? rows.find((r) => r.userId === user.id)?.rank : null),
    [rows, user]
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <span className="text-banana">🏆</span> Leaderboard
        </h1>
        <p className="text-muted text-sm">
          Top {TOP_N} players by highest single-game score.
          {user && myRank && <> You are <span className="text-banana font-semibold">#{myRank}</span>.</>}
        </p>
      </header>

      {/* Stats strip */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <Stat label="Games played" value={stats.totalGames} />
          <Stat label="Players"      value={stats.distinctPlayers} />
          <Stat label="Top score"    value={stats.topScore} accent />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6 text-center">
          {error}
          <button onClick={load} className="ml-3 underline">Retry</button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !rows.length && <Skeleton />}

      {/* Podium (top 3) */}
      {podium.length > 0 && (
        <div className="grid grid-cols-3 items-end gap-3 mb-10">
          <PodiumSlot player={podium[1]} place={2} />
          <PodiumSlot player={podium[0]} place={1} />
          <PodiumSlot player={podium[2]} place={3} />
        </div>
      )}

      {/* Table for ranks 4..N (and 1..3 if podium is empty for some reason) */}
      {rows.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="text-xs uppercase text-muted bg-black/20">
              <tr>
                <th className="px-4 py-3 w-16">Rank</th>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3 text-right">High score</th>
              </tr>
            </thead>
            <tbody>
              {(rest.length ? rest : rows).map((r) => (
                <tr
                  key={r.userId}
                  className={`border-t border-border ${
                    user && r.userId === user.id
                      ? 'bg-banana/10 text-banana'
                      : 'hover:bg-surface-2'
                  }`}
                >
                  <td className="px-4 py-3 text-muted font-mono">#{r.rank}</td>
                  <td className="px-4 py-3 font-medium">
                    {r.username}
                    {user && r.userId === user.id && (
                      <span className="ml-2 text-xs text-banana/70">(you)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">
                    {r.highScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {!loading && rows.length === 0 && !error && (
        <div className="text-center py-16 text-muted">
          <p className="mb-4">No scores yet.</p>
          <Link
            href="/play"
            className="inline-block px-5 py-2.5 rounded-lg bg-banana text-black font-semibold hover:bg-banana-dark"
          >
            Be the first to play
          </Link>
        </div>
      )}

      {/* Footer: Play CTA + last update */}
      <div className="mt-8 flex items-center justify-between text-xs text-muted">
        <button onClick={load} className="underline hover:text-white">
          Refresh
        </button>
        <div className="flex items-center gap-3">
          {lastUpdated && <span>Updated {lastUpdated.toLocaleTimeString()}</span>}
          <Link
            href="/play"
            className="px-3 py-1.5 rounded-md bg-banana text-black font-semibold hover:bg-banana-dark"
          >
            Play now
          </Link>
        </div>
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

function PodiumSlot({ player, place }) {
  // Heights create the classic 2-1-3 shape
  const heights = { 1: 'h-32', 2: 'h-24', 3: 'h-20' };
  const medals  = { 1: '🥇', 2: '🥈', 3: '🥉' };
  const bg      = { 1: 'bg-banana/20 border-banana/50', 2: 'bg-surface border-border', 3: 'bg-surface border-border' };

  if (!player) {
    return <div className="flex flex-col justify-end opacity-30">
      <div className={`rounded-t-xl border ${bg[place]} ${heights[place]}`} />
    </div>;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-2xl mb-1">{medals[place]}</div>
      <div className="text-sm font-semibold truncate w-full text-center mb-1">
        {player.username}
      </div>
      <div
        className={`w-full ${heights[place]} ${bg[place]} border rounded-t-xl flex items-center justify-center`}
      >
        <span className="text-xl font-mono font-bold text-banana">{player.highScore}</span>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-3 items-end gap-3 mb-10">
        <div className="h-24 rounded-t-xl bg-surface" />
        <div className="h-32 rounded-t-xl bg-surface" />
        <div className="h-20 rounded-t-xl bg-surface" />
      </div>
      <div className="h-64 rounded-2xl bg-surface" />
    </div>
  );
}