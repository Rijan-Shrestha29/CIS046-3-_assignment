// Banana Game API — Express entry point.
// Themes:
//  - Event-Driven Programming: each route is a handler for an HTTP event.
//  - Interoperability: CORS allows the Next.js origin to call this service
//    with credentials (cookies).
//  - Virtual Identity: cookie-parser enables reading the JWT cookie.
// References:
//   - Express:       https://expressjs.com/
//   - cors:          https://github.com/expressjs/cors
//   - cookie-parser: https://github.com/expressjs/cookie-parser
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// --- Middleware stack ---
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true, // allow the browser to send the JWT cookie
  })
);
app.use(express.json());
app.use(cookieParser());

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'banana-game-server',
    time: new Date().toISOString(),
  });
});

// --- Ping route (used by the frontend setup test) ---
app.get('/api/ping', (req, res) => {
  res.json({
    message: 'pong from backend',
    origin: req.headers.origin || 'no-origin',
  });
});

// --- Feature routes ---
app.use('/api/auth', authRoutes);

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🍌 Banana Game API → http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
});