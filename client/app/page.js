// Landing page — public. Explains the game and links to Play / Leaderboard.
import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="text-6xl font-bold mb-4">
        <span className="text-banana">🍌</span> Banana Game
      </h1>
      <p className="text-muted mb-10 text-lg">
        Solve each equation before your three lives run out.<br />
        Correct answer +5 points. Wrong answer −1 life.
      </p>

      <div className="flex flex-wrap gap-3 justify-center mb-12">
        <Link
          href="/play"
          className="px-6 py-3 rounded-lg bg-banana text-black font-semibold hover:bg-banana-dark transition"
        >
          Play Now
        </Link>
        <Link
          href="/leaderboard"
          className="px-6 py-3 rounded-lg border border-border hover:bg-surface-2 transition"
        >
          Leaderboard
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 text-left">
        <InfoCard title="Play for free" body="No account needed. Jump straight into a game." />
        <InfoCard title="Save your score" body="Log in before the game ends to appear on the leaderboard." />
        <InfoCard title="Challenge friends" body="Once logged in, challenge other players and compare scores." />
      </div>
    </div>
  );
}

function InfoCard({ title, body }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted">{body}</p>
    </div>
  );
}