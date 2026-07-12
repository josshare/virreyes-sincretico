const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/tours - list all tours
router.get('/', (req, res) => {
  db.all(
    `SELECT t.*, 
     (SELECT COUNT(*) FROM bookings WHERE tour_id = t.id AND status = 'confirmed') as booked_count
     FROM tours t`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// GET /api/tours/:id - get single tour with its checkpoints
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get(
    `SELECT t.*, 
     (SELECT COUNT(*) FROM bookings WHERE tour_id = t.id AND status = 'confirmed') as booked_count
     FROM tours t WHERE t.id = ?`,
    [id],
    (err, tour) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!tour) return res.status(404).json({ error: 'Tour not found' });
      // Optionally also return checkpoints in the same response, but we'll keep separate
      res.json(tour);
    }
  );
});

module.exports = router;