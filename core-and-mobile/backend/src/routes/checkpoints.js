// backend/src/routes/checkpoints.js
const express = require('express');
const router = express.Router();
const db = require('../db');
// We'll add contract mint later – for now just DB

// GET /api/checkpoints?tourId=1
router.get('/', (req, res) => {
  const { tourId } = req.query;
  if (!tourId) {
    return res.status(400).json({ error: 'tourId required' });
  }
  db.all(
    `SELECT * FROM checkpoints WHERE tour_id = ?`,
    [tourId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// GET /api/checkpoints/completions?tourId=1
router.get('/completions', (req, res) => {
  const userId = req.user.id;
  const { tourId } = req.query;
  if (!tourId) {
    return res.status(400).json({ error: 'tourId required' });
  }
  // Get all checkpoints for the tour, then left join completions for this user
  const query = `
    SELECT c.id as checkpoint_id, 
           CASE WHEN cc.id IS NOT NULL THEN 1 ELSE 0 END as completed,
           cc.completed_at, cc.tx_hash
    FROM checkpoints c
    LEFT JOIN checkpoint_completions cc ON cc.checkpoint_id = c.id AND cc.user_id = ?
    WHERE c.tour_id = ?
  `;
  db.all(query, [userId, tourId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Filter only completed ones (optional) – we'll return all with status
    res.json(rows.filter(r => r.completed === 1));
  });
});

// POST /api/checkpoints/complete
router.post('/complete', (req, res) => {
  const userId = req.user.id;
  const { checkpointId, photoUrl, lat, lng, paymentMethod } = req.body;
  if (!checkpointId) {
    return res.status(400).json({ error: 'checkpointId required' });
  }

  // 1. Get checkpoint details
  db.get(
    `SELECT * FROM checkpoints WHERE id = ?`,
    [checkpointId],
    async (err, checkpoint) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!checkpoint) return res.status(404).json({ error: 'Checkpoint not found' });

      // 2. Verify user has a booking for this tour
      db.get(
        `SELECT * FROM bookings WHERE user_id = ? AND tour_id = ? AND status = 'confirmed'`,
        [userId, checkpoint.tour_id],
        (err, booking) => {
          if (err) return res.status(500).json({ error: err.message });
          if (!booking) {
            return res.status(403).json({ error: 'You are not booked on this tour' });
          }

          // 3. Check if already completed
          db.get(
            `SELECT * FROM checkpoint_completions WHERE user_id = ? AND checkpoint_id = ?`,
            [userId, checkpointId],
            (err, existing) => {
              if (err) return res.status(500).json({ error: err.message });
              if (existing) {
                return res.status(400).json({ error: 'Checkpoint already completed' });
              }

              // 4. (Optional) Geolocation check if not in demo mode
              const isDemo = process.env.DEMO_MODE === 'true';
              if (!isDemo && (lat === undefined || lng === undefined)) {
                return res.status(400).json({ error: 'Location required' });
              }
              if (!isDemo) {
                const distance = getDistance(lat, lng, checkpoint.lat, checkpoint.lng);
                if (distance > checkpoint.radius_m) {
                  return res.status(400).json({ error: 'You are not at the checkpoint' });
                }
              }

              // 5. Mint tokens – we'll use a dummy tx hash for now (later integrate contract)
              const txHash = '0x' + Math.random().toString(16).substring(2, 42);
              const pointsEarned = checkpoint.points_reward;

              // 6. Record completion
              db.run(
                `INSERT INTO checkpoint_completions (user_id, checkpoint_id, tx_hash, photo_url)
                 VALUES (?, ?, ?, ?)`,
                [userId, checkpointId, txHash, photoUrl || ''],
                function(err) {
                  if (err) return res.status(500).json({ error: err.message });

                  // 7. Return success with tx hash and points
                  res.status(201).json({
                    message: 'Checkpoint completed!',
                    txHash,
                    pointsEarned,
                    // We'll later add balance update
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

// GET /api/checkpoints/:id - get a single checkpoint
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM checkpoints WHERE id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Checkpoint not found' });
    res.json(row);
  });
});

// Helper: distance calculation (Haversine)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = router;