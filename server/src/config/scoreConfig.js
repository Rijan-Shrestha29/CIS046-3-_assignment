// Score feature tunables — one source of truth for both service and validation.
module.exports = {
  MIN_SCORE: 0,
  MAX_SCORE: 100000,       // sanity cap so garbage values don't break the leaderboard
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_LEADERBOARD_LIMIT: 10,
  MAX_LEADERBOARD_LIMIT: 100,
};