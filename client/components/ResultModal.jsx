'use client';

// Game-over modal.
// If the user is logged in, we submit the score automatically.
// If not, we prompt them to log in to save the score
// (their score is preserved via ?pendingScore= query on /login).
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { scoreApi } from '@/lib/api';

export default function ResultModal({ score, loggedIn, onRestart }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState(null);

  // Auto-submit if logged in
  useEffect(() => {
    if (!loggedIn) return;
    let cancelled = false;
    (async () => {
      setSaving(true);
      try {
        await scoreApi.submit(score);
        if (!cancelled) setSaved(true);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not save score');
      } finally {
        if (!cancelled) setSaving(false);
      }
    })();
    return () => { cancelled = true; };
  }, [loggedIn, score]);

  const goToLogin = () => {
    // Preserve the score through the login flow
    router.push(`/login?redirect=${encodeURIComponent(`/play?save=${score}`)}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-2">Game Over</h2>
        <p className="text-center text-muted mb-6">You ran out of lives.</p>

        <div className="text-center mb-6">
          <div className="text-5xl font-mono font-bold text-banana">{score}</div>
          <div className="text-xs text-muted mt-1">final score</div>
        </div>

        {loggedIn && (
          <div className="text-sm text-center mb-4">
            {saving && <span className="text-muted">Saving…</span>}
            {saved && <span className="text-green-400">✅ Score saved to leaderboard</span>}
            {error && <span className="text-red-400">⚠ {error}</span>}
          </div>
        )}

        {!loggedIn && (
          <div className="bg-bg border border-border rounded-xl p-4 mb-4">
            <p className="text-sm text-muted mb-3 text-center">
              Log in to save your score to the leaderboard
            </p>
            <button
              onClick={goToLogin}
              className="w-full py-2.5 rounded-lg bg-banana text-black font-semibold hover:bg-banana-dark"
            >
              Log in &amp; save
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onRestart}
            className="flex-1 py-2.5 rounded-lg border border-border hover:bg-surface-2"
          >
            Play again
          </button>
          <button
            onClick={() => router.push('/leaderboard')}
            className="flex-1 py-2.5 rounded-lg border border-border hover:bg-surface-2"
          >
            Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}