const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middlewares/auth');   // <-- import it
const tourRoutes = require('./routes/tours');
const bookingRoutes = require('./routes/bookings');
const checkpointRoutes = require('./routes/checkpoints');
const redeemRoutes = require('./routes/redeem');
const userRoutes = require('./routes/user');
const walletRoutes = require('./routes/wallet');
const uploadRoutes = require('./routes/upload');

const app = express();
app.use(cors());
app.use(express.json());

// Logging middleware (optional)
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// 📌 PUBLIC routes (no token required)
app.use('/api/auth', authRoutes);

// 📌 PROTECTED routes – apply auth middleware to everything below
app.use(authMiddleware);

app.use('/api/tours', tourRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/checkpoints', checkpointRoutes);
app.use('/api/redeem', redeemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/uploads', express.static('uploads')); // serve static files

app.get('/', (req, res) => res.send('Backend running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));