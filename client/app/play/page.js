// Play page — public.
// Handles the ?save=<score> query after a login redirect so that
// a score earned anonymously can still be submitted once identity is established.
import GameBoard from '@/components/GameBoard';

export const metadata = { title: 'Play — Banana Game' };

export default function PlayPage() {
  return <GameBoard />;
}