const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const skillRoutes = require('./routes/skillRoutes');
const discoveryRoutes = require('./routes/discoveryRoutes');
const matchRoutes = require('./routes/matchRoutes');
const swapRoutes = require('./routes/swapRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', profileRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'SkillSwap API',
    version: '1.0.0',
    time: new Date().toISOString()
  });
});

// Single Page Application fallback for non-API routes
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, '../public/index.html'));
  }
  next();
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'An unexpected server error occurred',
    message: err.message
  });
});

module.exports = app;
