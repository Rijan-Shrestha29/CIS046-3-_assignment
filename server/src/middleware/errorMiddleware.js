// Centralised error handling.
// Uses err.statusCode if present (from ApiError), otherwise defaults.

const { logToFile } = require("../utils/logger");

// Reference: https://expressjs.com/en/guide/error-handling.html
const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Not Found - ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  // --- Server-side logging (operators see everything) ---
  // In production you'd pipe this to a log file or a service like Sentry.
  const logEntry = {
    time: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message: err.message,
    // Stack is logged only on the server, never returned to the client
    stack: err.stack,
  };
  // Unexpected (500) errors deserve more noise than expected (4xx) ones
  if (statusCode >= 500) {
      logToFile('error.log', logEntry);
  } else {
    console.warn('[WARN]', {
      time: logEntry.time,
      method: logEntry.method,
      url: logEntry.url,
      statusCode,
      message: logEntry.message,
    });
  }

  // --- Client-facing response (always clean) ---
  res.status(statusCode).json({
  // If a 500-level error was marked not-exposed, hide the real message.
  message: err.expose === false ? 'Internal server error' : err.message,
});

};

module.exports = { notFound, errorHandler };