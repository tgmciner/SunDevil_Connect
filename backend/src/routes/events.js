const express = require('express');
const pool = require('../db');
const { authRequired, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/events
router.get('/', async (req, res) => {
  const { sortBy, freeOnly } = req.query;
  let sql = `SELECT
      e.id,
      e.club_id AS clubId,
      e.title,
      e.description,
      e.date,
      e.location,
      e.price,
      e.category,
      (CASE WHEN e.price = 0 THEN 1 ELSE 0 END) AS isFree
    FROM events e`;
  const params = [];

  if (freeOnly === 'true') {
    sql += ' WHERE e.price = 0';
  }

  if (sortBy === 'date') {
    sql += ' ORDER BY e.date';
  }

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Get events error:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [rows] = await pool.query(
      `SELECT
        e.id,
        e.club_id AS clubId,
        e.title,
        e.description,
        e.date,
        e.location,
        e.price,
        e.category,
        (CASE WHEN e.price = 0 THEN 1 ELSE 0 END) AS isFree
       FROM events e WHERE e.id = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Get event error:', err);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// POST /api/events (leader only)
router.post('/', authRequired, requireRole(['leader']), async (req, res) => {
  const { clubId, title, description, date, location, price, category } = req.body;
  if (!clubId || !title || !date || !location) {
    return res.status(400).json({ error: 'clubId, title, date, and location are required' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO events (club_id, title, description, date, location, price, category)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [clubId, title, description || '', date, location, price || 0, category || null]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// POST /api/events/:id/register
router.post('/:id/register', authRequired, async (req, res) => {
  const eventId = Number(req.params.id);
  try {
    const [existing] = await pool.query(
      'SELECT id FROM registrations WHERE user_id = ? AND event_id = ? AND status = "registered"',
      [req.user.id, eventId]
    );
    if (existing.length > 0) {
      return res.json({ message: 'Already registered' });
    }

    const [result] = await pool.query(
      'INSERT INTO registrations (user_id, event_id, status) VALUES (?, ?, "registered")',
      [req.user.id, eventId]
    );
    res.status(201).json({ id: result.insertId, status: 'registered' });
  } catch (err) {
    console.error('Register event error:', err);
    res.status(500).json({ error: 'Failed to register for event' });
  }
});

// DELETE /api/events/:id/register (cancel)
router.delete('/:id/register', authRequired, async (req, res) => {
  const eventId = Number(req.params.id);
  try {
    await pool.query(
      'UPDATE registrations SET status = "cancelled" WHERE user_id = ? AND event_id = ?',
      [req.user.id, eventId]
    );
    res.json({ status: 'cancelled' });
  } catch (err) {
    console.error('Cancel registration error:', err);
    res.status(500).json({ error: 'Failed to cancel registration' });
  }
});

// GET /api/me/events
router.get('/me/list/all', authRequired, async (req, res) => {
  // placeholder if needed
});

// We'll mount /api/me/events as a separate path in server.js
// Query:
async function getMyEvents(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT
         e.id,
         e.title,
         e.date,
         e.location,
         r.status
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE r.user_id = ?`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Get my events error:', err);
    res.status(500).json({ error: 'Failed to fetch your events' });
  }
}

router.get('/__internal_my_events_handler', authRequired, getMyEvents);
router.getMyEvents = getMyEvents; // export handler for server.js

module.exports = router;
