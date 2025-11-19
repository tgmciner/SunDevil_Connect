require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const clubsRoutes = require('./routes/clubs');
const announcementsRoutes = require('./routes/announcements');
const eventsRoutes = require('./routes/events');
const adminRoutes = require('./routes/admin');
const { authRequired } = require('./middleware/auth');
const eventsRouter = require('./routes/events'); // for handler

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth
app.use('/api', authRoutes); // /api/login

// Clubs + leader + memberships
app.use('/api', clubsRoutes); // handles /api/clubs/*, /api/leader/*, /api/memberships/*

// Announcements (mounted under /api/clubs)
app.use('/api/clubs', announcementsRoutes);

// Events
app.use('/api/events', eventsRoutes);

// "My" endpoints (student views)
app.get('/api/me/clubs', authRequired, async (req, res, next) => {
  // simple query inline to avoid router path weirdness
  const pool = require('./db');
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.name, c.description, m.status AS membershipStatus
       FROM memberships m
       JOIN clubs c ON m.club_id = c.id
       WHERE m.user_id = ?`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Get my clubs error:', err);
    res.status(500).json({ error: 'Failed to fetch your clubs' });
  }
});

// /api/me/events using handler from events router
app.get('/api/me/events', authRequired, eventsRouter.getMyEvents);

// Admin
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`✅ Backend listening on http://localhost:${PORT}`);
});
