const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
// For wallet generation (if you have it) – we'll skip wallet for now
// to keep signup simple and get it working.
// Later you can add createCustodialWallet.

const router = express.Router();

router.post('/signup', (req, res) => {
  const { name, email, password, role = 'tourist' } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // Hash password
  const hashed = bcrypt.hashSync(password, 10);
  // For now, we don't generate a wallet yet (to avoid extra deps)
  // We'll store a placeholder wallet address.
  const walletAddress = '0x' + Math.random().toString(16).substring(2, 42);
  const walletEncrypted = 'dummy_encrypted';

  db.run(
    `INSERT INTO users (name, email, password, role, wallet_address, wallet_privkey_encrypted)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, email, hashed, role, walletAddress, walletEncrypted],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      const token = jwt.sign({ id: this.lastID, role }, process.env.JWT_SECRET);
      res.json({
        token,
        user: { id: this.lastID, name, email, role, walletAddress }
      });
    }
  );
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.wallet_address
      }
    });
  });
});

module.exports = router;