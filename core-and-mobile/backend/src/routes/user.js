const express = require('express');
const router = express.Router();

router.get('/:id/balance', (req, res) => {
  res.json({ balance: 0 }); // placeholder
});

module.exports = router;