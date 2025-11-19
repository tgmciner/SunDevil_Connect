const express = require("express");
const pool = require("../db");
const { authRequired, requireRole } = require("../middleware/auth");
const { eventBus } = require("../services");

const router = express.Router();

/**
 * Helper to safely parse numeric IDs from params
 */
function getNumericId(param) {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

// GET /api/clubs (approved only)
router.get("/clubs", async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, description FROM clubs WHERE status = "approved"'
    );
    res.json(rows);
  } catch (err) {
    console.error("Get clubs error:", err);
    res.status(500).json({ error: "Failed to fetch clubs" });
  }
});

// GET /api/clubs/:id
router.get("/clubs/:id", async (req, res) => {
  const clubId = getNumericId(req.params.id);
  if (!clubId) {
    return res.status(400).json({ error: "Invalid club ID" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, name, description, status FROM clubs WHERE id = ?",
      [clubId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Club not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Get club error:", err);
    res.status(500).json({ error: "Failed to fetch club" });
  }
});

// GET /api/clubs/:id/membership  (current user)
router.get("/clubs/:id/membership", authRequired, async (req, res) => {
  const clubId = getNumericId(req.params.id);
  if (!clubId) {
    return res.status(400).json({ error: "Invalid club ID" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT status FROM memberships WHERE user_id = ? AND club_id = ?",
      [req.user.id, clubId]
    );
    if (rows.length === 0) return res.json({ status: null });
    res.json({ status: rows[0].status });
  } catch (err) {
    console.error("Get membership status error:", err);
    res.status(500).json({ error: "Failed to fetch membership status" });
  }
});

// POST /api/clubs/:id/join
router.post("/clubs/:id/join", authRequired, async (req, res) => {
  const clubId = getNumericId(req.params.id);
  if (!clubId) {
    return res.status(400).json({ error: "Invalid club ID" });
  }

  try {
    const [existing] = await pool.query(
      "SELECT id, status FROM memberships WHERE user_id = ? AND club_id = ?",
      [req.user.id, clubId]
    );
    if (existing.length > 0) {
      return res.json({
        message: "Request already exists",
        status: existing[0].status,
      });
    }

    const [result] = await pool.query(
      'INSERT INTO memberships (user_id, club_id, role, status) VALUES (?, ?, "member", "pending")',
      [req.user.id, clubId]
    );

    res.status(201).json({ id: result.insertId, status: "pending" });
  } catch (err) {
    console.error("Join club error:", err);
    res.status(500).json({ error: "Failed to request membership" });
  }
});

// (Optional placeholder) GET /api/me/clubs – implemented elsewhere
// router.get("/me/list", authRequired, async (req, res) => {
//   // not used by frontend; handled in dedicated /me router instead
// });

// GET /api/leader/clubs
router.get("/leader/clubs", authRequired, requireRole(["leader"]), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT c.id, c.name, c.description
       FROM clubs c
       LEFT JOIN memberships m ON m.club_id = c.id AND m.role = 'leader'
       WHERE c.owner_id = ? OR m.user_id = ?`,
      [req.user.id, req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Leader clubs error:", err);
    res.status(500).json({ error: "Failed to fetch leader clubs" });
  }
});

// GET /api/leader/memberships/pending
router.get(
  "/leader/memberships/pending",
  authRequired,
  requireRole(["leader"]),
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT m.id, u.email AS studentEmail, c.name AS clubName
         FROM memberships m
         JOIN clubs c ON m.club_id = c.id
         JOIN users u ON m.user_id = u.id
         WHERE m.status = 'pending'
           AND (c.owner_id = ? OR EXISTS (
             SELECT 1 FROM memberships lm
             WHERE lm.club_id = c.id AND lm.user_id = ? AND lm.role = 'leader'
           ))`,
        [req.user.id, req.user.id]
      );

      const mapped = rows.map((r) => ({
        id: r.id,
        studentName: r.studentEmail,
        clubName: r.clubName,
      }));
      res.json(mapped);
    } catch (err) {
      console.error("Leader pending memberships error:", err);
      res.status(500).json({ error: "Failed to fetch membership requests" });
    }
  }
);

// PUT /api/memberships/:id/:decision (approve/deny)
router.put(
  "/memberships/:id/:decision",
  authRequired,
  requireRole(["leader"]),
  async (req, res) => {
    const membershipId = getNumericId(req.params.id);
    if (!membershipId) {
      return res.status(400).json({ error: "Invalid membership ID" });
    }

    const decision = req.params.decision;
    if (!["approve", "deny"].includes(decision)) {
      return res.status(400).json({ error: "Invalid decision" });
    }
    const newStatus = decision === "approve" ? "approved" : "denied";

    try {
      const [infoRows] = await pool.query(
        `SELECT u.email AS studentEmail, c.name AS clubName
         FROM memberships m
         JOIN users u ON m.user_id = u.id
         JOIN clubs c ON m.club_id = c.id
         WHERE m.id = ?`,
        [membershipId]
      );

      await pool.query("UPDATE memberships SET status = ? WHERE id = ?", [
        newStatus,
        membershipId,
      ]);

      if (newStatus === "approved" && infoRows.length > 0) {
        await eventBus.publish("membership.approved", {
          userEmail: infoRows[0].studentEmail,
          clubName: infoRows[0].clubName,
        });
      }

      res.json({ id: membershipId, status: newStatus });
    } catch (err) {
      console.error("Update membership error:", err);
      res.status(500).json({ error: "Failed to update membership" });
    }
  }
);

module.exports = router;
