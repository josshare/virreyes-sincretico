const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/bookings - book a tour
router.post('/', async (req, res) => {
  const userId = req.user.id; // now defined
  const { tourId } = req.body;

  if (!tourId) {
    return res.status(400).json({ error: 'Tour ID required' });
  }

  try {
    // 1. Get tour details
    const tour = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM tours WHERE id = ?`, [tourId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // 2. Get current booking count
    const bookingCount = await new Promise((resolve, reject) => {
      db.get(`SELECT COUNT(*) as count FROM bookings WHERE tour_id = ?`, [tourId], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.count : 0);
      });
    });

    // 3. Check capacity
    if (bookingCount >= tour.capacity) {
      return res.status(400).json({ error: 'Tour is full' });
    }

    // 4. Create booking
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO bookings (user_id, tour_id, status) VALUES (?, ?, ?)`,
        [userId, tourId, 'confirmed'],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    res.status(201).json({
      message: 'Booking successful',
      bookingId: result.id,
      tourName: tour.name
    });

  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/bookings - list user's bookings (optional)
router.get('/', async (req, res) => {
  const userId = req.user.id;
  try {
    const bookings = await new Promise((resolve, reject) => {
      db.all(
        `SELECT b.*, t.name as tour_name, t.date_time 
         FROM bookings b 
         JOIN tours t ON b.tour_id = t.id 
         WHERE b.user_id = ?`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;