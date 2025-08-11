const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const checkResourceOwnership = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (userRole === 'admin') {
    return next();
  }

  if (req.baseUrl.includes('transactions')) {
    const db = require('../config/database');
    const result = await db.query(
      'SELECT user_id FROM transactions WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (result.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Access denied to this resource' });
    }
  }

  next();
};

module.exports = {
  authenticateToken,
  authorize,
  checkResourceOwnership
};