const express = require('express');
const pool = require('../db');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// POST /api/login
router.post('/login', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  // Simple role rule for demo: email prefix controls role if new
  let inferredRole = 'student';
  const lower = email.toLowerCase();
  if (lower.startsWith('leader')) inferredRole = 'leader';
  if (lower.startsWith('admin')) inferredRole = 'admin';

  try {
    const [existing] = await pool.query(
      'SELECT id, email, role FROM users WHERE email = ?',
      [email]
    );

    let user;
    if (existing.length > 0) {
      user = existing[0];
    } else {
      const [result] = await pool.query(
        'INSERT INTO users (email, name, role) VALUES (?, ?, ?)',
        [email, email, inferredRole]
      );
      user = { id: result.insertId, email, role: inferredRole };
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, email: user.email, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
