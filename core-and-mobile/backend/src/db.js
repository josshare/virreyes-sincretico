// backend/src/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../data.sqlite'));

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT CHECK(role IN ('tourist','guide','hotel','admin')) DEFAULT 'tourist',
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      wallet_address TEXT UNIQUE,
      wallet_privkey_encrypted TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS tours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      capacity INTEGER,
      date_time DATETIME,
      price REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      tour_id INTEGER,
      status TEXT DEFAULT 'confirmed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(tour_id) REFERENCES tours(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS checkpoints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tour_id INTEGER,
      name TEXT,
      lat REAL,
      lng REAL,
      radius_m INTEGER,
      challenge_type TEXT,
      points_reward INTEGER,
      FOREIGN KEY(tour_id) REFERENCES tours(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS checkpoint_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      checkpoint_id INTEGER,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      tx_hash TEXT,
      photo_url TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(checkpoint_id) REFERENCES checkpoints(id),
      UNIQUE(user_id, checkpoint_id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      points_cost INTEGER
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS redemptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      reward_id INTEGER,
      tx_hash TEXT,
      redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      hotel_staff_id INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(reward_id) REFERENCES rewards(id)
    )
  `);
});

module.exports = db;