// backend/src/routes/redeem.js
const express = require('express');
const router = express.Router();
const db = require('../db');


router.post('/', async (req, res) => {
  const { userId, rewardId } = req.body;
  const hotelStaffId = req.user.id; // must be hotel role

  // Get reward cost
  const reward = await getReward(rewardId);
  const user = await getUser(userId);
  const balance = await getBalance(user.wallet_address);
  if (balance < reward.points_cost) {
    return res.status(400).json({ error: 'Insufficient points' });
  }

  // Burn
  const txHash = await burnPoints(user.wallet_address, reward.points_cost);

  // Record redemption
  db.run(
    `INSERT INTO redemptions (user_id, reward_id, tx_hash, hotel_staff_id)
     VALUES (?, ?, ?, ?)`,
    [userId, rewardId, txHash, hotelStaffId]
  );

  const newBalance = await getBalance(user.wallet_address);
  res.json({ txHash, newBalance });
});

module.exports = router;