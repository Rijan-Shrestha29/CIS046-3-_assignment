// Auth controller — HTTP boundary only.
// Delegates business logic to authService. No Prisma here.
const authService = require('../services/authService');
const generateToken = require('../utils/generateToken');

const cookieOptions = {
  httpOnly: true,                                 // JS cannot read → XSS mitigation
  secure: process.env.NODE_ENV === 'production',  // HTTPS only in prod
  sameSite: 'lax',                                // CSRF mitigation
  maxAge: 7 * 24 * 60 * 60 * 1000,                // 7 days
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    const token = generateToken(user.id);
    res.cookie('token', token, cookieOptions);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const user = await authService.authenticateUser(req.body);
    const token = generateToken(user.id);
    res.cookie('token', token, cookieOptions);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
const logout = (req, res) => {
  res.cookie('token', '', { ...cookieOptions, maxAge: 0 });
  res.json({ message: 'Logged out' });
};

// GET /api/auth/me  (req.user set by protect middleware)
const me = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, logout, me };