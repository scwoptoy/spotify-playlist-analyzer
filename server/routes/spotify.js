const express = require('express');
const axios = require('axios');
const router = express.Router();

// Get user's playlists
router.get('/playlists', async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No valid access token provided' });
  }

  const accessToken = authHeader.replace('Bearer ', '');

  try {
    // Get user's playlists from Spotify
    const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        limit: 50 // Get up to 50 playlists
      }
    });

    // Return simplified playlist data
    const playlists = response.data.items.map(playlist => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      tracks: {
        total: playlist.tracks.total
      },
      images: playlist.images,
      owner: {
        display_name: playlist.owner.display_name
      },
      public: playlist.public
    }));

    res.json({
      playlists,
      total: response.data.total
    });

  } catch (error) {
    console.error('Error fetching playlists:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Access token expired or invalid' });
    }
    
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No valid access token provided' });
  }

  const accessToken = authHeader.replace('Bearer ', '');

  try {
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({
      id: response.data.id,
      display_name: response.data.display_name,
      email: response.data.email,
      followers: response.data.followers.total,
      images: response.data.images
    });

  } catch (error) {
    console.error('Error fetching profile:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

module.exports = router;