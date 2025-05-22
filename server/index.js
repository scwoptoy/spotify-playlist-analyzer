const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import auth routes
const authRoutes = require('./routes/auth');
const spotifyRoutes = require('./routes/spotify');

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date() });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Spotify Playlist Analyzer API' });
});

// Use auth routes
app.use('/auth', authRoutes);
app.use('/api/spotify', spotifyRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://127.0.0.1:${PORT}/api`);
  console.log(`🎵 Spotify auth available at http://127.0.0.1:${PORT}/auth/login`);
});