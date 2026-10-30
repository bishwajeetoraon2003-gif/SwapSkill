const jwt = require('jsonwebtoken');
const store = require('../data/store');

const JWT_SECRET = process.env.JWT_SECRET || 'skillswap_super_secure_jwt_secret_key_2025';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers['x-auth-token'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = store.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User account no longer exists.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers['x-auth-token'];
  if (!authHeader) {
    req.user = null;
    return next();
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = store.findUserById(decoded.id);
    req.user = user || null;
  } catch (err) {
    req.user = null;
  }
  next();
}

module.exports = {
  JWT_SECRET,
  generateToken,
  requireAuth,
  optionalAuth
};
