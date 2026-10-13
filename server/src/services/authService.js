// Auth service — business logic for user identity.
// No Express, no req/res. Throw ApiError to indicate HTTP status.
// Theme: Virtual Identity (bcrypt hashing, brute-force lockout).
// Reference: https://github.com/dcodeIO/bcrypt.js
const bcrypt = require("bcryptjs");
const prisma = require("../config/db");
const ApiError = require("../utils/ApiError");
const {
  SALT_ROUNDS,
  MIN_PASSWORD_LEN,
  MAX_FAILED_LOGINS,
  LOCK_DURATION_MS,
} = require("../config/authConfig");

const PUBLIC_USER_FIELDS = { id: true, username: true, createdAt: true };

// --- Register (unchanged except constants) ---
const registerUser = async ({ username, password }) => {
  if (!username || !password)
    throw new ApiError(400, "Username and password are required");
  if (password.length < MIN_PASSWORD_LEN) {
    throw new ApiError(
      400,
      `Password must be at least ${MIN_PASSWORD_LEN} characters`,
    );
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) throw new ApiError(409, "Username already taken");

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { username, password: hashed },
    select: PUBLIC_USER_FIELDS,
  });

  return user;
};

// --- Login with per-account lockout ---
const authenticateUser = async ({ username, password }) => {
  if (!username || !password)
    throw new ApiError(400, "Username and password are required");

  const user = await prisma.user.findUnique({ where: { username } });

  // If the username doesn't exist, still return the same generic 401.
  // Don't leak existence AND don't create lockout state for a phantom user.
  if (!user) throw new ApiError(401, "Invalid credentials");

  // 1) Is the account currently locked?
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const secondsLeft = Math.ceil((user.lockedUntil - Date.now()) / 1000);
    throw new ApiError(
      429,
      `Account locked due to too many failed logins. Try again in ${secondsLeft}s.`,
    );
  }

  // 2) Compare passwords
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    const newCount = user.failedLoginCount + 1;

    if (newCount >= MAX_FAILED_LOGINS) {
      // Lock the account
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: 0, // reset counter for after the lock expires
          lockedUntil: new Date(Date.now() + LOCK_DURATION_MS),
        },
      });
      const mins = Math.round(LOCK_DURATION_MS / 60000);
      throw new ApiError(
        429,
        `Account locked for ${mins} minutes due to too many failed logins.`,
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: newCount },
    });

    const remaining = MAX_FAILED_LOGINS - newCount;
    // NOTE: still the generic message, but if you want user feedback you can
    // include "remaining attempts" in a development-only message.
    throw new ApiError(
      401,
      `Invalid credentials (${remaining} attempts remaining)`,
    );
  }

  // 3) Success — reset counters
  if (user.failedLoginCount > 0 || user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null },
    });
  }

  return { id: user.id, username: user.username, createdAt: user.createdAt };
};

// --- Lookup by id ---
const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: PUBLIC_USER_FIELDS,
  });
  if (!user) throw new ApiError(401, "User no longer exists");
  return user;
};

module.exports = { registerUser, authenticateUser, getUserById };
