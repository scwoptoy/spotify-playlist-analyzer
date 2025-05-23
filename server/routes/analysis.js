const express = require('express');
const axios = require('axios');
const router = express.Router();

// Analyze a specific playlist
router.get('/playlist/:playlistId', async (req, res) => {
  const { playlistId } = req.params;
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No valid access token provided' });
  }

  const accessToken = authHeader.replace('Bearer ', '');

  try {
    console.log(`🎵 Analyzing playlist: ${playlistId}`);
    
    // Step 1: Get playlist details
    const playlistResponse = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const playlist = playlistResponse.data;
    
    // Step 2: Get all tracks (handle pagination if needed)
    let allTracks = [];
    let tracksUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;
    
    while (tracksUrl) {
      const tracksResponse = await axios.get(tracksUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      // Filter out null tracks (deleted songs)
      const validTracks = tracksResponse.data.items
        .filter(item => item.track && item.track.id)
        .map(item => item.track);
      
      allTracks.push(...validTracks);
      tracksUrl = tracksResponse.data.next;
    }

    console.log(`📊 Found ${allTracks.length} valid tracks`);

    // Step 3: Try to get audio features (with fallback)
    let audioFeatures = [];
    let hasAudioFeatures = false;
    
    if (allTracks.length > 0) {
      try {
        const trackIds = allTracks.map(track => track.id);
        
        // Try to get audio features in batches
        for (let i = 0; i < trackIds.length; i += 100) {
          const batch = trackIds.slice(i, i + 100);
          try {
            const featuresResponse = await axios.get('https://api.spotify.com/v1/audio-features', {
              headers: { 'Authorization': `Bearer ${accessToken}` },
              params: { ids: batch.join(',') }
            });
            audioFeatures.push(...featuresResponse.data.audio_features.filter(Boolean));
          } catch (batchError) {
            console.log(`⚠️ Skipping batch ${Math.floor(i/100) + 1} due to permissions`);
          }
        }
        
        hasAudioFeatures = audioFeatures.length > 0;
        console.log(`🎼 Retrieved audio features for ${audioFeatures.length} tracks`);
        
      } catch (error) {
        console.log('⚠️ Audio features not available, using alternative analysis');
      }
    }

    // Step 4: Analyze with available data
    const analysis = analyzePlaylistData(allTracks, playlist, audioFeatures, hasAudioFeatures);

    res.json(analysis);

  } catch (error) {
    console.error('Error analyzing playlist:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Access token expired or invalid' });
    }
    
    res.status(500).json({ 
      error: 'Failed to analyze playlist',
      details: error.message 
    });
  }
});

// Enhanced analysis function that works with or without audio features
function analyzePlaylistData(tracks, playlist, audioFeatures = [], hasAudioFeatures = false) {
  if (tracks.length === 0) {
    return {
      playlist: {
        id: playlist.id,
        name: playlist.name,
        trackCount: 0
      },
      error: 'No tracks available for analysis'
    };
  }

  // Calculate basic stats
  const totalDuration = tracks.reduce((sum, track) => sum + track.duration_ms, 0);
  
  // Analyze track metadata
  const artistCounts = {};
  const genreCounts = {};
  const popularityValues = tracks.map(track => track.popularity).filter(p => p !== null);
  const decades = {};
  const explicit = tracks.filter(track => track.explicit).length;

  tracks.forEach(track => {
    // Count artists
    track.artists.forEach(artist => {
      artistCounts[artist.name] = (artistCounts[artist.name] || 0) + 1;
    });

    // Analyze release decades
    if (track.album && track.album.release_date) {
      const year = parseInt(track.album.release_date.substring(0, 4));
      if (!isNaN(year)) {
        const decade = Math.floor(year / 10) * 10;
        decades[decade] = (decades[decade] || 0) + 1;
      }
    }
  });

  // Generate analysis based on available data
  let audioAnalysis = null;
  let tasteProfile = null;

  if (hasAudioFeatures && audioFeatures.length > 0) {
    // Full analysis with audio features
    const features = ['energy', 'valence', 'danceability', 'acousticness', 'instrumentalness', 'speechiness', 'tempo', 'loudness'];
    
    const averages = {};
    features.forEach(feature => {
      const values = audioFeatures.map(af => af[feature]).filter(v => v !== null);
      averages[feature] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    });

    audioAnalysis = {
      averages,
      distribution: calculateDistribution(audioFeatures)
    };

    tasteProfile = generateTasteDescription(averages);
  } else {
    // Alternative analysis without audio features
    tasteProfile = generateAlternativeTasteProfile(tracks, popularityValues, decades, explicit);
  }

  // Top artists
  const topArtists = Object.entries(artistCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Popularity analysis
  const avgPopularity = popularityValues.length > 0 
    ? popularityValues.reduce((a, b) => a + b, 0) / popularityValues.length 
    : 0;

  return {
    playlist: {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      trackCount: tracks.length,
      totalDuration
    },
    audioFeatures: audioAnalysis,
    tasteProfile,
    popularity: {
      average: Math.round(avgPopularity),
      distribution: categorizePopularity(popularityValues)
    },
    topArtists,
    decades,
    metadata: {
      explicitTracks: explicit,
      explicitPercentage: Math.round((explicit / tracks.length) * 100),
      averageTrackLength: Math.round(totalDuration / tracks.length),
      hasAudioFeatures
    },
    analysis: {
      timestamp: new Date().toISOString(),
      trackCount: tracks.length,
      analysisType: hasAudioFeatures ? 'Full Analysis' : 'Metadata Analysis'
    }
  };
}

// Generate taste profile without audio features
function generateAlternativeTasteProfile(tracks, popularityValues, decades, explicitCount) {
  const descriptions = [];
  const avgPopularity = popularityValues.length > 0 
    ? popularityValues.reduce((a, b) => a + b, 0) / popularityValues.length 
    : 0;

  // Popularity-based insights
  if (avgPopularity > 70) {
    descriptions.push("mainstream hits");
  } else if (avgPopularity > 40) {
    descriptions.push("mix of popular and underground tracks");
  } else {
    descriptions.push("underground and niche music");
  }

  // Era-based insights
  const sortedDecades = Object.entries(decades).sort(([,a], [,b]) => b - a);
  if (sortedDecades.length > 0) {
    const topDecade = sortedDecades[0][0];
    if (topDecade >= 2010) {
      descriptions.push("modern music");
    } else if (topDecade >= 2000) {
      descriptions.push("2000s nostalgia");
    } else if (topDecade >= 1990) {
      descriptions.push("90s throwbacks");
    } else {
      descriptions.push("classic tracks");
    }
  }

  // Content rating
  const explicitPercentage = (explicitCount / tracks.length) * 100;
  if (explicitPercentage > 50) {
    descriptions.push("explicit content heavy");
  }

  return {
    summary: `This playlist features ${descriptions.slice(0, 2).join(" and ")}`,
    characteristics: descriptions,
    mood: "Analysis based on track metadata",
    energy: `Average popularity: ${Math.round(avgPopularity)}/100`,
    danceability: "Audio features not available",
    note: "For detailed audio analysis (energy, mood, danceability), a Spotify Premium account may be required."
  };
}

// Helper functions
function categorizePopularity(popularityValues) {
  const ranges = { "0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0 };
  
  popularityValues.forEach(pop => {
    if (pop <= 20) ranges["0-20"]++;
    else if (pop <= 40) ranges["21-40"]++;
    else if (pop <= 60) ranges["41-60"]++;
    else if (pop <= 80) ranges["61-80"]++;
    else ranges["81-100"]++;
  });
  
  return ranges;
}

function calculateDistribution(audioFeatures) {
  const features = ['energy', 'valence', 'danceability', 'acousticness'];
  const distributions = {};
  
  features.forEach(feature => {
    const values = audioFeatures.map(af => af[feature]).sort((a, b) => a - b);
    const len = values.length;
    
    distributions[feature] = {
      min: values[0],
      q1: values[Math.floor(len * 0.25)],
      median: values[Math.floor(len * 0.5)],
      q3: values[Math.floor(len * 0.75)],
      max: values[len - 1]
    };
  });
  
  return distributions;
}

function generateTasteDescription(averages) {
  const descriptions = [];

  if (averages.energy > 0.7) {
    descriptions.push("high-energy");
  } else if (averages.energy > 0.4) {
    descriptions.push("moderate energy");
  } else {
    descriptions.push("low-energy, chill");
  }

  if (averages.valence > 0.6) {
    descriptions.push("upbeat and positive");
  } else if (averages.valence > 0.4) {
    descriptions.push("balanced mood");
  } else {
    descriptions.push("melancholic or introspective");
  }

  if (averages.danceability > 0.7) {
    descriptions.push("very danceable");
  } else if (averages.danceability > 0.5) {
    descriptions.push("moderately danceable");
  }

  return {
    summary: `This playlist features ${descriptions.slice(0, 3).join(", ")} music`,
    characteristics: descriptions,
    mood: categorizeValence(averages.valence),
    energy: categorizeEnergy(averages.energy),
    danceability: categorizeDanceability(averages.danceability)
  };
}

function categorizeValence(valence) {
  if (valence > 0.7) return "Very Positive";
  if (valence > 0.5) return "Positive";
  if (valence > 0.3) return "Neutral";
  return "Melancholic";
}

function categorizeEnergy(energy) {
  if (energy > 0.8) return "Very High Energy";
  if (energy > 0.6) return "High Energy";
  if (energy > 0.4) return "Moderate Energy";
  return "Low Energy";
}

function categorizeDanceability(danceability) {
  if (danceability > 0.8) return "Extremely Danceable";
  if (danceability > 0.6) return "Very Danceable";
  if (danceability > 0.4) return "Moderately Danceable";
  return "Not Very Danceable";
}

module.exports = router;