const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = header.substring(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET); // { id, email, role }
    req.user = payload;
    next();
  } catch (err) {
    console.error('JWT verify error:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = { authRequired, requireRole, JWT_SECRET };
