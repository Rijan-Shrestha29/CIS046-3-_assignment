// Score controller — HTTP boundary only, delegates to scoreService.
const scoreService = require('../services/scoreService');

// POST /api/scores
const submit = async (req, res, next) => {
  try {
    const score = await scoreService.submitScore(req.user.id, req.body.score);
    res.status(201).json({ score });
  } catch (err) {
    next(err);
  }
};

// GET /api/scores/me?page=1&pageSize=20
const myScores = async (req, res, next) => {
  try {
    const result = await scoreService.getMyScores(req.user.id, {
      page: req.query.page,
      pageSize: req.query.pageSize,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/scores/me/highscore
const myHighScore = async (req, res, next) => {
  try {
    const result = await scoreService.getMyHighScore(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/scores/leaderboard?limit=10
const leaderboard = async (req, res, next) => {
  try {
    const board = await scoreService.getLeaderboard(req.query.limit);
    res.json({ leaderboard: board });
  } catch (err) {
    next(err);
  }
};

// GET /api/scores/stats
const stats = async (req, res, next) => {
  try {
    const result = await scoreService.getStats();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { submit, myScores, myHighScore, leaderboard, stats };