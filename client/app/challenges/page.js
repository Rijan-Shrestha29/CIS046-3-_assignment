'use client';

// Challenges — placeholder.
//
// The backend endpoints for challenges (POST /api/challenges,
// PATCH /api/challenges/:id/accept etc.) are documented in the schema
// but the frontend UI is intentionally deferred.
//
// Delivering a stub page rather than an empty route means:
//   - the navbar link works and doesn't 404
//   - the shape of the future feature is visible to a reviewer
//   - the branch is small and focused (good version-control hygiene)
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function ChallengesPage() {
  const { user, loading } = useAuth();

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-6">⚔️</div>

      <h1 className="text-4xl font-bold mb-3">
        Challenges
        <span className="ml-3 align-middle text-xs font-semibold uppercase tracking-wider
                         bg-banana/20 text-banana border border-banana/40 rounded-full px-3 py-1">
          Coming soon
        </span>
      </h1>

      <p className="text-muted mb-10 max-w-md mx-auto">
        Soon you'll be able to challenge another player to a race — both
        play the same round of equations and the highest score wins.
      </p>

      <ul className="text-left max-w-md mx-auto space-y-3 mb-10">
        <FeatureRow
          icon="🔍"
          title="Find a player"
          body="Search by username and send a challenge."
        />
        <FeatureRow
          icon="📥"
          title="Inbox"
          body="Accept or decline incoming challenges."
        />
        <FeatureRow
          icon="🎯"
          title="Play the round"
          body="Solve equations. Your score is recorded automatically."
        />
        <FeatureRow
          icon="🥇"
          title="See the result"
          body="Once both players submit, the winner is shown."
        />
      </ul>

      {/* Contextual CTA depending on session state */}
      {loading ? (
        <p className="text-muted text-sm">…</p>
      ) : user ? (
        <p className="text-muted text-sm">
          You're logged in as <span className="text-banana">{user.username}</span>.
          Challenges will appear here when the feature ships.
        </p>
      ) : (
        <>
          <p className="text-muted text-sm mb-4">
            You'll need to be logged in to send or receive challenges.
          </p>
          <Link
            href="/login?redirect=%2Fchallenges"
            className="inline-block px-5 py-2.5 rounded-lg bg-banana text-black font-semibold hover:bg-banana-dark"
          >
            Log in to be ready
          </Link>
        </>
      )}

      <div className="mt-16">
        <Link
          href="/play"
          className="text-sm text-muted hover:text-white underline"
        >
          ← Back to the game
        </Link>
      </div>
    </div>
  );
}

function FeatureRow({ icon, title, body }) {
  return (
    <li className="flex items-start gap-3 bg-surface border border-border rounded-xl p-4">
      <span className="text-2xl leading-none">{icon}</span>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-muted">{body}</div>
      </div>
    </li>
  );
}