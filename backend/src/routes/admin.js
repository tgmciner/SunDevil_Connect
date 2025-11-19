const express = require('express');
const pool = require('../db');
const { authRequired, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/clubs/pending
router.get('/clubs/pending', authRequired, requireRole(['admin']), async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, description FROM clubs WHERE status = "pending"'
    );
    res.json(rows);
  } catch (err) {
    console.error('Admin pending clubs error:', err);
    res.status(500).json({ error: 'Failed to fetch pending clubs' });
  }
});

// PUT /api/admin/clubs/:id/approve
router.put('/clubs/:id/approve', authRequired, requireRole(['admin']), async (req, res) => {
  const id = Number(req.params.id);
  try {
    await pool.query(
      'UPDATE clubs SET status = "approved" WHERE id = ?',
      [id]
    );
    res.json({ id, status: 'approved' });
  } catch (err) {
    console.error('Admin approve club error:', err);
    res.status(500).json({ error: 'Failed to approve club' });
  }
});

module.exports = router;
