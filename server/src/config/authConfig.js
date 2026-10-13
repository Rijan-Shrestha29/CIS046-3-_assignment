// Tunable auth security constants.
// Kept in one place so both the service and any tests refer to the same numbers.
module.exports = {
  SALT_ROUNDS: 10,
  MIN_PASSWORD_LEN: 6,
  MAX_FAILED_LOGINS: 5,              // after this many failures, lock
  LOCK_DURATION_MS: 5 * 60 * 1000,  // 5 minutes
};