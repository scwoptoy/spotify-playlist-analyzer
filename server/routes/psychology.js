const express = require('express');
const router = express.Router();

// Big Five personality analysis based on research findings
function analyzeBigFivePersonality(tracks, audioFeatures, metadata) {
  const personality = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0
  };

  const insights = {
    openness: [],
    conscientiousness: [],
    extraversion: [],
    agreeableness: [],
    neuroticism: []
  };

  // Openness analysis (based on your research: prefers sophisticated/complex music)
  const genreDiversity = calculateGenreDiversity(tracks);
  const artistDiversity = calculateArtistDiversity(tracks);
  const popularityRange = calculatePopularityRange(tracks);
  
  personality.openness = (genreDiversity * 0.4 + artistDiversity * 0.3 + (1 - popularityRange.mainstream_ratio) * 0.3);
  
  if (personality.openness > 0.7) {
    insights.openness.push("High openness: You actively seek out complex, sophisticated music and explore diverse genres");
    insights.openness.push("You likely value artistic innovation and aren't swayed by mainstream popularity alone");
  } else if (personality.openness > 0.4) {
    insights.openness.push("Moderate openness: You balance familiar favorites with occasional musical exploration");
  } else {
    insights.openness.push("You prefer consistency in your musical choices, valuing familiar styles and proven favorites");
  }

  // Conscientiousness analysis (based on research: negative correlation with intense/rebellious music)
  if (audioFeatures && audioFeatures.length > 0) {
    const avgEnergy = audioFeatures.reduce((sum, af) => sum + af.energy, 0) / audioFeatures.length;
    const avgLoudness = audioFeatures.reduce((sum, af) => sum + af.loudness, 0) / audioFeatures.length;
    
    // Lower energy and loudness suggests higher conscientiousness
    personality.conscientiousness = Math.max(0, 1 - (avgEnergy * 0.6 + (avgLoudness + 60) / 60 * 0.4));
    
    if (personality.conscientiousness > 0.6) {
      insights.conscientiousness.push("High conscientiousness: Your music choices suggest you value structure and avoid overly intense or chaotic sounds");
      insights.conscientiousness.push("You likely use music to maintain focus and emotional stability");
    }
  }

  // Extraversion analysis (based on research: prefers upbeat, rhythmic, electronic music)
  if (audioFeatures && audioFeatures.length > 0) {
    const avgValence = audioFeatures.reduce((sum, af) => sum + af.valence, 0) / audioFeatures.length;
    const avgDanceability = audioFeatures.reduce((sum, af) => sum + af.danceability, 0) / audioFeatures.length;
    const avgEnergy = audioFeatures.reduce((sum, af) => sum + af.energy, 0) / audioFeatures.length;
    
    personality.extraversion = (avgValence * 0.4 + avgDanceability * 0.3 + avgEnergy * 0.3);
    
    if (personality.extraversion > 0.7) {
      insights.extraversion.push("High extraversion: Your music is energetic and social - perfect for parties and group settings");
      insights.extraversion.push("You likely use music to energize yourself and connect with others");
    } else if (personality.extraversion > 0.4) {
      insights.extraversion.push("Balanced social energy: Your playlists work for both solo listening and social situations");
    } else {
      insights.extraversion.push("Introspective listener: You prefer contemplative, personal music experiences");
    }
  }

  // Agreeableness analysis (based on research: general music appreciation, emotional responses)
  const trackCount = tracks.length;
  const averagePopularity = tracks.reduce((sum, track) => sum + track.popularity, 0) / trackCount;
  
  // Higher track count and broader popularity range suggests agreeableness
  personality.agreeableness = Math.min(1, (trackCount / 50) * 0.5 + (averagePopularity / 100) * 0.5);
  
  if (personality.agreeableness > 0.6) {
    insights.agreeableness.push("High agreeableness: You appreciate a wide range of music and likely enjoy discovering what others like");
    insights.agreeableness.push("Your musical empathy shows in your diverse and inclusive playlist choices");
  }

  // Neuroticism analysis (based on research: drawn to intense music for emotional regulation)
  if (audioFeatures && audioFeatures.length > 0) {
    const emotionalVariability = calculateEmotionalVariability(audioFeatures);
    const intensityPreference = calculateIntensityPreference(audioFeatures);
    
    personality.neuroticism = (emotionalVariability * 0.6 + intensityPreference * 0.4);
    
    if (personality.neuroticism > 0.6) {
      insights.neuroticism.push("Uses music for emotional regulation: Your playlist shows sophisticated emotional processing through music");
      insights.neuroticism.push("You likely turn to music during emotional moments for processing and healing");
    }
  }

  return {
    scores: personality,
    insights: insights,
    summary: generatePersonalitySummary(personality)
  };
}

// Helper functions for psychological analysis
function calculateGenreDiversity(tracks) {
  // Estimate genre diversity from artist variety and track characteristics
  const artists = new Set(tracks.flatMap(track => track.artists.map(artist => artist.name)));
  return Math.min(1, artists.size / 20); // Normalize to 0-1
}

function calculateArtistDiversity(tracks) {
  const artistCounts = {};
  tracks.forEach(track => {
    track.artists.forEach(artist => {
      artistCounts[artist.name] = (artistCounts[artist.name] || 0) + 1;
    });
  });
  
  const maxCount = Math.max(...Object.values(artistCounts));
  const artistSpread = Object.keys(artistCounts).length;
  return Math.min(1, artistSpread / 30) * (1 - maxCount / tracks.length);
}

function calculatePopularityRange(tracks) {
  const popularities = tracks.map(track => track.popularity);
  const avg = popularities.reduce((a, b) => a + b, 0) / popularities.length;
  const mainstream_ratio = avg / 100;
  return { mainstream_ratio, diversity: Math.max(...popularities) - Math.min(...popularities) };
}

function calculateEmotionalVariability(audioFeatures) {
  const valences = audioFeatures.map(af => af.valence);
  const energies = audioFeatures.map(af => af.energy);
  
  const valenceStd = calculateStandardDeviation(valences);
  const energyStd = calculateStandardDeviation(energies);
  
  return (valenceStd + energyStd) / 2;
}

function calculateIntensityPreference(audioFeatures) {
  const avgEnergy = audioFeatures.reduce((sum, af) => sum + af.energy, 0) / audioFeatures.length;
  const avgLoudness = audioFeatures.reduce((sum, af) => sum + af.loudness, 0) / audioFeatures.length;
  
  return (avgEnergy + (avgLoudness + 60) / 60) / 2;
}

function calculateStandardDeviation(values) {
  const mean = values.reduce((a, b) => a + b) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
}

function generatePersonalitySummary(personality) {
  const traits = [];
  
  if (personality.openness > 0.6) traits.push("musically adventurous");
  if (personality.conscientiousness > 0.6) traits.push("structured listener");
  if (personality.extraversion > 0.6) traits.push("socially energized");
  if (personality.agreeableness > 0.6) traits.push("musically empathetic");
  if (personality.neuroticism > 0.6) traits.push("emotionally sophisticated");
  
  if (traits.length === 0) traits.push("balanced musical personality");
  
  return `Your musical personality: ${traits.join(", ")}`;
}

module.exports = {
  analyzeBigFivePersonality
};