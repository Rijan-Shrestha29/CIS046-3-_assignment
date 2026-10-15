const express = require('express');
const {
  submit,
  myScores,
  myHighScore,
  leaderboard,
  stats,
} = require('../controllers/scoreController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/leaderboard', leaderboard);
router.get('/stats', stats);

// Protected routes (auth required)
router.post('/', protect, submit);
router.get('/me', protect, myScores);
router.get('/me/highscore', protect, myHighScore);

module.exports = router;