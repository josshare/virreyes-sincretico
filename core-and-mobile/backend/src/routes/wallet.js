const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/wallet/transactions - get all mint and burn transactions for the user
router.get('/transactions', (req, res) => {
  const userId = req.user.id;

  // We'll combine checkpoint completions (mints) and redemptions (burns)
  const query = `
    SELECT 
      'mint' as type,
      cc.completed_at as date,
      c.points_reward as amount,
      c.name as description,
      cc.tx_hash
    FROM checkpoint_completions cc
    JOIN checkpoints c ON cc.checkpoint_id = c.id
    WHERE cc.user_id = ?
    UNION ALL
    SELECT 
      'burn' as type,
      r.redeemed_at as date,
      -rw.points_cost as amount,
      rw.name as description,
      r.tx_hash
    FROM redemptions r
    JOIN rewards rw ON r.reward_id = rw.id
    WHERE r.user_id = ?
    ORDER BY date DESC
    LIMIT 50
  `;

  db.all(query, [userId, userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Format response
    const formatted = rows.map(row => ({
      description: row.description,
      amount: row.amount,
      date: row.date,
      txHash: row.tx_hash,
      type: row.type,
    }));
    res.json(formatted);
  });
});

// Optionally, get current balance (calls contract) – we'll keep it in PointsContext for now
// But we can add a GET /balance endpoint if needed.

module.exports = router;