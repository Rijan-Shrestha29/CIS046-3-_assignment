// Banana Game — minimal server bootstrap
// Purpose: verify Express + env + CORS + cookies before building features.
// Themes touched: Interoperability (CORS for Next.js origin), Event-Driven (HTTP handlers)
// References:
//   - Express:      https://expressjs.com/
//   - cookie-parser: https://github.com/expressjs/cookie-parser
//   - CORS:          https://github.com/expressjs/cors
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// --- Middleware ---
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true, // allow cookies cross-origin
}));
app.use(express.json());
app.use(cookieParser());

// --- Health check (the "setup test" endpoint) ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'banana-game-server',
    time: new Date().toISOString(),
  });
});

// --- Ping route to test CORS from the Next.js frontend ---
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong from backend', origin: req.headers.origin || 'no-origin' });
});

// --- 404 handler (last) ---
app.use((req, res) => {
  res.status(404).json({ message: `Not found - ${req.originalUrl}` });
});

// --- Error handler ---
app.use((err, req, res, next) => {
  console.error(err);
  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    message: err.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🍌 Banana Game API → http://localhost:${PORT}`);
  console.log(`   Test:  http://localhost:${PORT}/api/health`);
});