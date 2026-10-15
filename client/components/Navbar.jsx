'use client';

// Top navigation — shows Login/Logout depending on session state.
// Theme: Virtual Identity — the UI reflects "who am I right now".
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="border-b border-border bg-surface/70 backdrop-blur sticky top-0 z-40">
      <nav className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-banana">🍌</span>
          <span>Banana Game</span>
        </Link>

        <div className="flex items-center gap-1 text-sm">
          <Link href="/play"         className="px-3 py-1.5 rounded hover:bg-surface-2">Play</Link>
          <Link href="/leaderboard"  className="px-3 py-1.5 rounded hover:bg-surface-2">Leaderboard</Link>

          {user && (
            <Link href="/challenges" className="px-3 py-1.5 rounded hover:bg-surface-2">Challenges</Link>
          )}

          {loading ? (
            <span className="px-3 py-1.5 text-muted">…</span>
          ) : user ? (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-muted hidden sm:inline">Hi, {user.username}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded bg-surface-2 hover:bg-border"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="ml-2 px-3 py-1.5 rounded bg-banana text-black font-semibold hover:bg-banana-dark"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}