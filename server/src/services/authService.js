// Auth service — business logic for user identity.
// No Express, no req/res. Throw ApiError to indicate HTTP status.
// Theme: Virtual Identity (bcrypt hashing).
// Reference: https://github.com/dcodeIO/bcrypt.js
const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LEN = 6;

const PUBLIC_USER_FIELDS = { id: true, username: true, createdAt: true };

// --- Register ---
const registerUser = async ({ username, password }) => {
  if (!username || !password) {
    throw new ApiError(400, 'Username and password are required');
  }
  if (password.length < MIN_PASSWORD_LEN) {
    throw new ApiError(400, `Password must be at least ${MIN_PASSWORD_LEN} characters`);
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    throw new ApiError(409, 'Username already taken');
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { username, password: hashed },
    select: PUBLIC_USER_FIELDS,
  });

  return user;
};

// --- Login ---
const authenticateUser = async ({ username, password }) => {
  if (!username || !password) {
    throw new ApiError(400, 'Username and password are required');
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    // Deliberately generic message so callers can't enumerate usernames
    throw new ApiError(401, 'Invalid credentials');
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new ApiError(401, 'Invalid credentials');
  }

  return { id: user.id, username: user.username, createdAt: user.createdAt };
};

// --- Lookup by id (used by auth middleware) ---
const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: PUBLIC_USER_FIELDS,
  });
  if (!user) throw new ApiError(401, 'User no longer exists');
  return user;
};

module.exports = { registerUser, authenticateUser, getUserById };