const express = require('express');
const pool = require('../db');
const { authRequired } = require('../middleware/auth');
const { eventBus } = require('../services');

const router = express.Router({ mergeParams: true });

// GET /api/clubs/:id/announcements
router.get('/:id/announcements', async (req, res) => {
  const clubId = Number(req.params.id);
  try {
    const [rows] = await pool.query(
      `SELECT id, text, created_at AS createdAt
       FROM announcements
       WHERE club_id = ?
       ORDER BY created_at DESC`,
      [clubId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Get announcements error:', err);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// POST /api/clubs/:id/announcements
router.post('/:id/announcements', authRequired, async (req, res) => {
  const clubId = Number(req.params.id);
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO announcements (club_id, text) VALUES (?, ?)',
      [clubId, text]
    );
    const [rows] = await pool.query(
      'SELECT id, text, created_at AS createdAt FROM announcements WHERE id = ?',
      [result.insertId]
    );
    const announcement = { ...rows[0], clubId };
    // Observer + Adapter
    await eventBus.publish('announcement.created', announcement);

    res.status(201).json(announcement);
  } catch (err) {
    console.error('Post announcement error:', err);
    res.status(500).json({ error: 'Failed to post announcement' });
  }
});

module.exports = router;
