// Big Five personality analysis based on research findings - IMPROVED VERSION
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

  // Improved Openness analysis (works well based on user feedback)
  const genreDiversity = calculateGenreDiversity(tracks);
  const artistDiversity = calculateArtistDiversity(tracks);
  const popularityRange = calculatePopularityRange(tracks);
  
  personality.openness = Math.max(0.1, Math.min(0.95, 
    genreDiversity * 0.4 + artistDiversity * 0.3 + (1 - popularityRange.mainstream_ratio) * 0.3
  ));
  
  if (personality.openness > 0.7) {
    insights.openness.push("High openness: You actively seek out complex, sophisticated music and explore diverse genres");
    insights.openness.push("You likely value artistic innovation and aren't swayed by mainstream popularity alone");
  } else if (personality.openness > 0.4) {
    insights.openness.push("Moderate openness: You balance familiar favorites with occasional musical exploration");
  } else {
    insights.openness.push("You prefer consistency in your musical choices, valuing familiar styles and proven favorites");
  }

  // Improved Conscientiousness analysis (less extreme)
  let conscientiousnessScore = 0.3; // Base score to avoid 0%
  
  if (audioFeatures && audioFeatures.length > 0) {
    const avgEnergy = audioFeatures.reduce((sum, af) => sum + af.energy, 0) / audioFeatures.length;
    const avgLoudness = audioFeatures.reduce((sum, af) => sum + af.loudness, 0) / audioFeatures.length;
    
    // More nuanced scoring - map energy/loudness to conscientiousness scale
    const energyFactor = 1 - (avgEnergy * 0.3); // Less weight on energy
    const loudnessFactor = 1 - ((avgLoudness + 60) / 60 * 0.2); // Less weight on loudness
    conscientiousnessScore = Math.max(0.1, Math.min(0.9, 
      conscientiousnessScore + energyFactor * 0.4 + loudnessFactor * 0.3
    ));
  } else {
    // Use playlist organization as conscientiousness indicator
    const playlistLength = tracks.length;
    const avgTrackLength = metadata.totalDuration / tracks.length;
    
    // Longer, more organized playlists suggest conscientiousness
    const organizationFactor = Math.min(1, playlistLength / 30) * 0.3;
    const consistencyFactor = avgTrackLength > 180000 ? 0.2 : 0.1; // Longer songs suggest patience
    conscientiousnessScore += organizationFactor + consistencyFactor;
  }
  
  personality.conscientiousness = conscientiousnessScore;
  
  if (personality.conscientiousness > 0.6) {
    insights.conscientiousness.push("Organized listener: Your music choices suggest you value structure and thoughtful curation");
    insights.conscientiousness.push("You likely use music to maintain focus and emotional stability");
  } else if (personality.conscientiousness > 0.3) {
    insights.conscientiousness.push("Balanced approach: You mix spontaneous and planned music choices");
  } else {
    insights.conscientiousness.push("Spontaneous listener: You prefer impulsive, in-the-moment music discovery");
  }

  // Improved Extraversion analysis (less binary)
  let extraversionScore = 0.2; // Base score
  
  if (audioFeatures && audioFeatures.length > 0) {
    const avgValence = audioFeatures.reduce((sum, af) => sum + af.valence, 0) / audioFeatures.length;
    const avgDanceability = audioFeatures.reduce((sum, af) => sum + af.danceability, 0) / audioFeatures.length;
    const avgEnergy = audioFeatures.reduce((sum, af) => sum + af.energy, 0) / audioFeatures.length;
    
    extraversionScore = Math.max(0.1, Math.min(0.9,
      avgValence * 0.35 + avgDanceability * 0.35 + avgEnergy * 0.3
    ));
  } else {
    // Use popularity and artist social factors as indicators
    const avgPopularity = metadata.avgPopularity / 100;
    const artistCount = metadata.artistDiversity;
    
    // More popular music and diverse artists can suggest social orientation
    extraversionScore = Math.max(0.1, Math.min(0.7,
      extraversionScore + avgPopularity * 0.3 + Math.min(1, artistCount / 20) * 0.2
    ));
  }
  
  personality.extraversion = extraversionScore;
  
  if (personality.extraversion > 0.7) {
    insights.extraversion.push("High extraversion: Your music is energetic and social - perfect for parties and group settings");
    insights.extraversion.push("You likely use music to energize yourself and connect with others");
  } else if (personality.extraversion > 0.4) {
    insights.extraversion.push("Balanced social energy: Your playlists work for both solo listening and social situations");
  } else {
    insights.extraversion.push("Introspective listener: You prefer contemplative, personal music experiences");
  }

  // Improved Agreeableness analysis (working well based on feedback)
  const trackCount = tracks.length;
  const averagePopularity = metadata.avgPopularity;
  
  // More sophisticated agreeableness calculation
  const diversityTolerance = Math.min(1, Object.keys(calculateArtistCounts(tracks)).length / 15);
  const popularityBalance = 1 - Math.abs(averagePopularity - 50) / 50; // Balanced popularity suggests agreeableness
  
  personality.agreeableness = Math.max(0.2, Math.min(0.95,
    diversityTolerance * 0.4 + popularityBalance * 0.3 + Math.min(1, trackCount / 40) * 0.3
  ));
  
  if (personality.agreeableness > 0.7) {
    insights.agreeableness.push("High agreeableness: You appreciate a wide range of music and likely enjoy discovering what others like");
    insights.agreeableness.push("Your musical empathy shows in your diverse and inclusive playlist choices");
  } else if (personality.agreeableness > 0.4) {
    insights.agreeableness.push("Moderate agreeableness: You balance personal preferences with openness to others' tastes");
  } else {
    insights.agreeableness.push("Strong personal taste: You prioritize your own musical preferences over popular consensus");
  }

  // Improved Neuroticism analysis (more nuanced)
  let neuroticismScore = 0.25; // Base score
  
  if (audioFeatures && audioFeatures.length > 0) {
    const emotionalVariability = calculateEmotionalVariability(audioFeatures);
    const intensityPreference = calculateIntensityPreference(audioFeatures);
    const valenceSpread = calculateValenceSpread(audioFeatures);
    
    neuroticismScore = Math.max(0.1, Math.min(0.8,
      emotionalVariability * 0.4 + intensityPreference * 0.3 + valenceSpread * 0.3
    ));
  } else {
    // Use explicit content and era diversity as indicators
    const explicitRatio = metadata.explicit / tracks.length;
    const eraSpread = Object.keys(calculateDecades(tracks)).length;
    
    neuroticismScore = Math.max(0.1, Math.min(0.7,
      neuroticismScore + explicitRatio * 0.2 + Math.min(1, eraSpread / 5) * 0.2
    ));
  }
  
  personality.neuroticism = neuroticismScore;
  
  if (personality.neuroticism > 0.6) {
    insights.neuroticism.push("Emotionally sophisticated: Your playlist shows complex emotional processing through music");
    insights.neuroticism.push("You likely turn to music during emotional moments for processing and regulation");
  } else if (personality.neuroticism > 0.3) {
    insights.neuroticism.push("Emotionally balanced: You use music for both stability and emotional expression");
  } else {
    insights.neuroticism.push("Emotionally stable: Your music choices suggest consistent emotional regulation");
  }

  return {
    scores: personality,
    insights: insights,
    summary: generatePersonalitySummary(personality)
  };
}

// Helper functions (improved)
function calculateGenreDiversity(tracks) {
  const artists = new Set(tracks.flatMap(track => track.artists.map(artist => artist.name)));
  return Math.min(1, artists.size / 15); // Adjusted threshold
}

function calculateArtistDiversity(tracks) {
  const artistCounts = calculateArtistCounts(tracks);
  const maxCount = Math.max(...Object.values(artistCounts));
  const artistSpread = Object.keys(artistCounts).length;
  
  // More nuanced calculation
  const spreadScore = Math.min(1, artistSpread / 20);
  const repetitionPenalty = maxCount / tracks.length;
  return spreadScore * (1 - repetitionPenalty * 0.5);
}

function calculateArtistCounts(tracks) {
  const artistCounts = {};
  tracks.forEach(track => {
    track.artists.forEach(artist => {
      artistCounts[artist.name] = (artistCounts[artist.name] || 0) + 1;
    });
  });
  return artistCounts;
}

function calculateDecades(tracks) {
  const decades = {};
  tracks.forEach(track => {
    if (track.album && track.album.release_date) {
      const year = parseInt(track.album.release_date.substring(0, 4));
      if (!isNaN(year)) {
        const decade = Math.floor(year / 10) * 10;
        decades[decade] = (decades[decade] || 0) + 1;
      }
    }
  });
  return decades;
}

function calculatePopularityRange(tracks) {
  const popularities = tracks.map(track => track.popularity);
  const avg = popularities.reduce((a, b) => a + b, 0) / popularities.length;
  const mainstream_ratio = avg / 100;
  return { 
    mainstream_ratio, 
    diversity: Math.max(...popularities) - Math.min(...popularities),
    average: avg
  };
}

function calculateEmotionalVariability(audioFeatures) {
  const valences = audioFeatures.map(af => af.valence);
  const energies = audioFeatures.map(af => af.energy);
  
  const valenceStd = calculateStandardDeviation(valences);
  const energyStd = calculateStandardDeviation(energies);
  
  return Math.min(1, (valenceStd + energyStd) / 1.4); // Normalized
}

function calculateValenceSpread(audioFeatures) {
  const valences = audioFeatures.map(af => af.valence);
  const minValence = Math.min(...valences);
  const maxValence = Math.max(...valences);
  return maxValence - minValence;
}

function calculateIntensityPreference(audioFeatures) {
  const avgEnergy = audioFeatures.reduce((sum, af) => sum + af.energy, 0) / audioFeatures.length;
  const avgLoudness = audioFeatures.reduce((sum, af) => sum + af.loudness, 0) / audioFeatures.length;
  
  return Math.min(1, (avgEnergy + (avgLoudness + 60) / 60) / 2);
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
  if (personality.conscientiousness > 0.5) traits.push("organized listener");
  if (personality.extraversion > 0.6) traits.push("socially energized");
  if (personality.agreeableness > 0.6) traits.push("musically empathetic");
  if (personality.neuroticism > 0.5) traits.push("emotionally sophisticated");
  
  if (traits.length === 0) traits.push("balanced musical personality");
  
  return `Your musical personality: ${traits.join(", ")}`;
}

module.exports = {
  analyzeBigFivePersonality
};