// JWT signing utility — establishes "virtual identity" via a signed token.
// Reference: https://github.com/auth0/node-jsonwebtoken
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;