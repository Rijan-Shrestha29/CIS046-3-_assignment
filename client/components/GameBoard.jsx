'use client';

// The core game.
//
// Rules:
//   - Each round fetches a new equation from the Banana API.
//   - Correct answer → +5 points, new round.
//   - Wrong answer   → lose 1 life, new round.
//   - Start with 3 lives. When lives = 0 → game over.
//   - Final score = points accumulated this game.
//
// Interoperability:
//   - Banana API (third-party): http://marcconrad.com/uob/banana/api.php
//   - Backend API: POST /api/scores (requires auth)
//
// Event-driven:
//   - Every round is triggered by the previous round's resolution
//     (submit → validate → fetch next equation).
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { bananaApi, scoreApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ResultModal from './ResultModal';

const STARTING_LIVES = 3;
const POINTS_PER_CORRECT = 5;

export default function GameBoard() {
  const { user } = useAuth();

  const [lives, setLives]           = useState(STARTING_LIVES);
  const [score, setScore]           = useState(0);
  const [round, setRound]           = useState(1);
  const [equation, setEquation]     = useState(null);   // { question, solution }
  const [answer, setAnswer]         = useState('');
  const [feedback, setFeedback]     = useState(null);   // 'correct' | 'wrong' | null
  const [loadingEq, setLoadingEq]   = useState(false);
  const [error, setError]           = useState(null);
  const [gameOver, setGameOver]     = useState(false);

  // --- Fetch a new equation ---
  const fetchEquation = useCallback(async () => {
    setLoadingEq(true);
    setError(null);
    setAnswer('');
    setFeedback(null);
    try {
      const data = await bananaApi.fetchEquation();
      // Banana API returns { question: "<image url>", solution: <int> }
      setEquation(data);
    } catch (err) {
      setError('Could not load equation. Check your connection and try again.');
    } finally {
      setLoadingEq(false);
    }
  }, []);

  // Start first round on mount
  useEffect(() => {
    fetchEquation();
  }, [fetchEquation]);

  // --- Submit an answer ---
  const submitAnswer = (e) => {
    e.preventDefault();
    if (!equation || !answer.trim()) return;

    const numeric = Number(answer);
    if (Number.isNaN(numeric)) {
      setFeedback('wrong');
      return;
    }

    const correct = numeric === equation.solution;
    let nextLives = lives;
    let nextScore = score;

    if (correct) {
      nextScore = score + POINTS_PER_CORRECT;
      setFeedback('correct');
      setScore(nextScore);
    } else {
      nextLives = lives - 1;
      setFeedback('wrong');
      setLives(nextLives);
    }

    // Wait briefly so user sees feedback, then progress
    setTimeout(() => {
      if (nextLives <= 0) {
        setGameOver(true);
      } else {
        setRound((r) => r + 1);
        fetchEquation();
      }
    }, 700);
  };

  // --- Restart ---
  const restart = () => {
    setLives(STARTING_LIVES);
    setScore(0);
    setRound(1);
    setGameOver(false);
    setFeedback(null);
    setAnswer('');
    fetchEquation();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* HUD */}
      <div className="flex items-center justify-between mb-6">
        <Lives count={lives} />
        <div className="text-sm text-muted">Round {round}</div>
        <div className="font-mono text-lg">
          <span className="text-muted mr-1">score</span>
          <span className="text-banana font-bold">{score}</span>
        </div>
      </div>

      {/* Equation card */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl">
        <p className="text-sm text-muted mb-3">
          Solve the equation shown in the image:
        </p>

        <div className="flex justify-center items-center min-h-[220px] bg-bg rounded-xl border border-border">
          {loadingEq && <span className="text-muted">Loading equation…</span>}
          {error && !loadingEq && (
            <div className="text-center text-red-400 px-4">
              <p>{error}</p>
              <button onClick={fetchEquation} className="mt-3 underline text-sm">Retry</button>
            </div>
          )}
          {equation && !loadingEq && (
            <img
              src={equation.question}
              alt="Equation to solve"
              className="max-h-[200px] object-contain"
              draggable={false}
            />
          )}
        </div>

        {/* Answer form */}
        <form onSubmit={submitAnswer} className="mt-6 flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer"
            disabled={!equation || loadingEq || feedback !== null}
            className="flex-1 px-4 py-3 rounded-lg bg-bg border border-border focus:border-banana outline-none text-center text-lg font-mono"
          />
          <button
            type="submit"
            disabled={!equation || loadingEq || !answer.trim() || feedback !== null}
            className="px-6 py-3 rounded-lg bg-banana text-black font-semibold hover:bg-banana-dark disabled:opacity-50"
          >
            Submit
          </button>
        </form>

        {/* Feedback */}
        {feedback === 'correct' && (
          <p className="mt-4 text-center text-green-400 font-semibold">
            ✅ Correct! +{POINTS_PER_CORRECT} points
          </p>
        )}
        {feedback === 'wrong' && (
          <p className="mt-4 text-center text-red-400 font-semibold">
            ❌ Wrong answer — you lost a life
          </p>
        )}
      </div>

      {/* Rules hint */}
      <p className="text-xs text-muted text-center mt-6">
        Correct answer: <span className="text-banana">+{POINTS_PER_CORRECT}</span> · Wrong answer: <span className="text-red-400">−1 life</span>
      </p>

      {/* Game over modal */}
      {gameOver && (
        <ResultModal
          score={score}
          loggedIn={!!user}
          onRestart={restart}
        />
      )}
    </div>
  );
}

function Lives({ count }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${count} lives`}>
      {Array.from({ length: STARTING_LIVES }).map((_, i) => (
        <span
          key={i}
          className={`text-xl transition-opacity ${i < count ? 'opacity-100' : 'opacity-25'}`}
        >
          🍌
        </span>
      ))}
    </div>
  );
}