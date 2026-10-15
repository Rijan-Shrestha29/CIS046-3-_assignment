// Score service — all score business logic.
// No Express, no req/res. Throws ApiError for HTTP status.
//
// Design note on leaderboard aggregation:
//   Two strategies:
//     (a) store a highScore column on User, update on every submission
//     (b) compute max(score) per user with Prisma groupBy on request
//   We use (b) because the write path is simpler, there's no risk of the
//   cached value drifting out of sync, and at assignment scale the query is
//   fast. At very large scale we would denormalise (a) and add a background
//   job — this is a tradeoff I document for the video.
const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const {
  MIN_SCORE,
  MAX_SCORE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  DEFAULT_LEADERBOARD_LIMIT,
  MAX_LEADERBOARD_LIMIT,
} = require('../config/scoreConfig');

// --- Validation helper ---
const validateScore = (score) => {
  if (typeof score !== 'number' || Number.isNaN(score)) {
    throw new ApiError(400, 'Score must be a number');
  }
  if (!Number.isInteger(score)) {
    throw new ApiError(400, 'Score must be an integer');
  }
  if (score < MIN_SCORE || score > MAX_SCORE) {
    throw new ApiError(400, `Score must be between ${MIN_SCORE} and ${MAX_SCORE}`);
  }
};

// --- Submit a new score ---
const submitScore = async (userId, rawScore) => {
  validateScore(rawScore);

  const created = await prisma.score.create({
    data: { score: rawScore, userId },
    select: { id: true, score: true, createdAt: true },
  });

  return created;
};

// --- Personal history (paginated) ---
const getMyScores = async (userId, { page = 1, pageSize } = {}) => {
  const take = Math.min(Number(pageSize) || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const skip = Math.max((Number(page) - 1) * take, 0);

  const [total, scores] = await Promise.all([
    prisma.score.count({ where: { userId } }),
    prisma.score.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: { id: true, score: true, createdAt: true },
    }),
  ]);

  return {
    total,
    page: Number(page),
    pageSize: take,
    pages: Math.ceil(total / take) || 1,
    scores,
  };
};

// --- Personal high score ---
const getMyHighScore = async (userId) => {
  const result = await prisma.score.aggregate({
    where: { userId },
    _max: { score: true },
    _count: { _all: true },
  });

  return {
    highScore: result._max.score ?? 0,
    gamesPlayed: result._count._all,
  };
};

// --- Global leaderboard: one row per user, using their max score ---
const getLeaderboard = async (rawLimit) => {
  const limit = Math.min(
    Number(rawLimit) || DEFAULT_LEADERBOARD_LIMIT,
    MAX_LEADERBOARD_LIMIT
  );

  // Step 1 — aggregate max score per user
  // Prisma groupBy: https://www.prisma.io/docs/orm/reference/prisma-client-reference#groupby
  const grouped = await prisma.score.groupBy({
    by: ['userId'],
    _max: { score: true },
    orderBy: { _max: { score: 'desc' } },
    take: limit,
  });

  if (grouped.length === 0) return [];

  // Step 2 — hydrate usernames
  const userIds = grouped.map((g) => g.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, username: true },
  });
  const userMap = Object.fromEntries(users.map((u) => [u.id, u.username]));

  // Step 3 — shape the response with rank
  return grouped.map((g, i) => ({
    rank: i + 1,
    userId: g.userId,
    username: userMap[g.userId] ?? 'Unknown',
    highScore: g._max.score,
  }));
};

// --- Public stats ---
const getStats = async () => {
  const [totalGames, distinctPlayers, top] = await Promise.all([
    prisma.score.count(),
    prisma.score.findMany({
      distinct: ['userId'],
      select: { userId: true },
    }).then((rows) => rows.length),
    prisma.score.findFirst({
      orderBy: { score: 'desc' },
      select: { score: true, user: { select: { username: true } } },
    }),
  ]);

  return {
    totalGames,
    distinctPlayers,
    topScore: top?.score ?? 0,
    topPlayer: top?.user?.username ?? null,
  };
};

module.exports = {
  submitScore,
  getMyScores,
  getMyHighScore,
  getLeaderboard,
  getStats,
};