// A tiny error subclass carrying an HTTP status code.
// Services throw ApiError; controllers pass it to next().
// Keeps services free of Express — they only describe "what went wrong"
// and what status it should map to.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;