// LLM-Powered Narrative Generation for Advanced Musical Psychology Analysis

const axios = require('axios');

class MusicPsychologyNarrator {
  constructor() {
    // You can use OpenAI, Anthropic, or any LLM API
    this.apiKey = process.env.OPENAI_API_KEY; // Add to your .env file
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
  }

  async generateAdvancedNarrative(analysisData) {
    try {
      const { playlist, psychologyProfile, topArtists, popularity, decades, metadata } = analysisData;
      
      // Create sophisticated prompt based on all available data
      const prompt = this.buildNarrativePrompt(analysisData);
      
      console.log('🤖 Generating advanced psychological narrative...');
      
      if (!this.apiKey) {
        // Fallback to template-based narrative if no API key
        return this.generateTemplateNarrative(analysisData);
      }

      const response = await axios.post(this.apiUrl, {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a music psychologist and expert in personality analysis through musical preferences. Generate sophisticated, insightful, and personal narratives about someone's musical psychology based on their playlist data. Be specific, nuanced, and avoid generic statements."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const narrative = response.data.choices[0].message.content;
      
      return {
        advanced_narrative: narrative,
        narrative_type: 'LLM_Generated',
        confidence_score: this.calculateNarrativeConfidence(analysisData),
        key_insights: this.extractKeyInsights(narrative),
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      console.log('⚠️ LLM narrative generation failed, using advanced template:', error.message);
      return this.generateTemplateNarrative(analysisData);
    }
  }

  buildNarrativePrompt(data) {
    const { playlist, psychologyProfile, topArtists, popularity, decades, metadata, tasteProfile } = data;
    
    return `Analyze this person's musical psychology and create a sophisticated, personal narrative about their musical identity:

PLAYLIST: "${playlist.name}" (${playlist.trackCount} tracks, ${Math.round(playlist.totalDuration / 60000)} minutes)

PERSONALITY SCORES:
- Openness: ${Math.round(psychologyProfile.scores.openness * 100)}%
- Conscientiousness: ${Math.round(psychologyProfile.scores.conscientiousness * 100)}%
- Extraversion: ${Math.round(psychologyProfile.scores.extraversion * 100)}%
- Agreeableness: ${Math.round(psychologyProfile.scores.agreeableness * 100)}%
- Neuroticism: ${Math.round(psychologyProfile.scores.neuroticism * 100)}%

TOP ARTISTS: ${topArtists.slice(0, 5).map(a => `${a.name} (${a.count})`).join(', ')}

MUSICAL CHARACTERISTICS:
- Average popularity: ${popularity.average}/100
- Era distribution: ${Object.entries(decades).map(([decade, count]) => `${decade}s: ${count}`).join(', ')}
- Explicit content: ${metadata.explicitPercentage}%
- Artist diversity: ${metadata.artistCount} different artists

TASTE PROFILE: ${tasteProfile.summary}

Generate a 3-paragraph narrative that:
1. MUSICAL IDENTITY: Describe their core musical identity and what their choices reveal about their personality
2. BEHAVIORAL PATTERNS: Analyze their listening patterns and emotional relationship with music  
3. UNIQUE INSIGHTS: Provide specific, non-obvious insights about their musical psychology that they might not know about themselves

Be specific, avoid generic statements, and make it feel personally relevant. Focus on the psychology behind their choices, not just describing the music.`;
  }

  generateTemplateNarrative(data) {
    const { playlist, psychologyProfile, topArtists, popularity, decades, metadata } = data;
    const scores = psychologyProfile.scores;
    
    // Advanced template-based narrative generation
    const narrativeElements = {
      musical_identity: this.generateIdentityNarrative(scores, topArtists, popularity),
      behavioral_patterns: this.generateBehavioralNarrative(scores, metadata, playlist),
      unique_insights: this.generateUniqueInsights(scores, decades, topArtists, metadata)
    };

    const fullNarrative = `${narrativeElements.musical_identity}\n\n${narrativeElements.behavioral_patterns}\n\n${narrativeElements.unique_insights}`;

    return {
      advanced_narrative: fullNarrative,
      narrative_type: 'Advanced_Template',
      confidence_score: this.calculateNarrativeConfidence(data),
      key_insights: [
        this.getHighestTraitInsight(scores),
        this.getArtistPatternInsight(topArtists),
        this.getPopularityInsight(popularity.average)
      ],
      generated_at: new Date().toISOString()
    };
  }

  generateIdentityNarrative(scores, topArtists, popularity) {
    const dominantTrait = this.getDominantTrait(scores);
    const artistPattern = this.analyzeArtistPattern(topArtists);
    const popularityProfile = this.analyzePopularityProfile(popularity.average);

    return `Your musical identity centers around ${dominantTrait.description}. ${artistPattern} This suggests someone who ${dominantTrait.behavioral_indicator}. Your ${popularityProfile} indicates a listener who ${this.getPopularityPersonality(popularity.average)}, revealing a sophisticated approach to music discovery that balances personal taste with cultural awareness.`;
  }

  generateBehavioralNarrative(scores, metadata, playlist) {
    const regulationStyle = this.getEmotionalRegulationStyle(scores);
    const organizationalStyle = this.getOrganizationalStyle(metadata, playlist);
    const socialContext = this.getSocialContext(scores);

    return `Your relationship with music suggests ${regulationStyle}. ${organizationalStyle} This indicates ${socialContext}, suggesting you curate music not just for personal enjoyment but as a form of emotional architecture - building soundscapes that support your psychological needs and social connections.`;
  }

  generateUniqueInsights(scores, decades, topArtists, metadata) {
    const temporalPattern = this.analyzeTemporalPattern(decades);
    const expertiseLevel = this.calculateExpertiseLevel(metadata);
    const personalityConflicts = this.findPersonalityConflicts(scores);

    return `What makes your musical psychology unique: ${temporalPattern} Combined with ${expertiseLevel}, this reveals someone who ${personalityConflicts}. Your playlist serves as both a mirror of your current psychological state and a tool for emotional regulation - you're not just consuming music, you're actively curating your inner emotional landscape through carefully chosen sonic experiences.`;
  }

  // Helper methods for narrative generation
  getDominantTrait(scores) {
    const traits = Object.entries(scores).sort(([,a], [,b]) => b - a);
    const [traitName, score] = traits[0];
    
    const traitDescriptions = {
      openness: { 
        description: "musical exploration and aesthetic sophistication",
        behavioral_indicator: "approaches music as an art form rather than mere entertainment"
      },
      agreeableness: { 
        description: "musical empathy and inclusive taste",
        behavioral_indicator: "uses music to connect with others and appreciate diverse perspectives"
      },
      conscientiousness: { 
        description: "structured and purposeful listening",
        behavioral_indicator: "approaches music with intention and organizational thinking"
      },
      extraversion: { 
        description: "socially energizing musical choices",
        behavioral_indicator: "selects music that enhances social connection and personal energy"
      },
      neuroticism: { 
        description: "emotionally nuanced musical processing",
        behavioral_indicator: "leverages music for complex emotional regulation and self-understanding"
      }
    };
    
    return traitDescriptions[traitName];
  }

  analyzeArtistPattern(topArtists) {
    if (topArtists.length === 0) return "Your artist selection shows interesting patterns.";
    
    const totalTracks = topArtists.reduce((sum, artist) => sum + artist.count, 0);
    const topArtistRatio = topArtists[0].count / totalTracks;
    
    if (topArtistRatio > 0.3) {
      return `Your strong affinity for ${topArtists[0].name} (${topArtists[0].count} tracks) suggests deep artist loyalty and preference for consistency.`;
    } else {
      return `Your balanced artist distribution, with ${topArtists[0].name} as your most-played (${topArtists[0].count} tracks), indicates curatorial sophistication.`;
    }
  }

  analyzePopularityProfile(avgPopularity) {
    if (avgPopularity > 75) return "mainstream-oriented taste";
    if (avgPopularity > 50) return "balanced mainstream-underground approach";
    if (avgPopularity > 25) return "underground-leaning preferences";
    return "deeply alternative taste";
  }

  getPopularityPersonality(avgPopularity) {
    if (avgPopularity > 75) return "values cultural connection and shared musical experiences";
    if (avgPopularity > 50) return "balances social relevance with personal discovery";
    if (avgPopularity > 25) return "prioritizes artistic merit over commercial success";
    return "actively seeks music that challenges conventional taste";
  }

  getEmotionalRegulationStyle(scores) {
    if (scores.neuroticism > 0.6) {
      return "a sophisticated approach to emotional regulation through music";
    } else if (scores.openness > 0.7) {
      return "music as a tool for intellectual and aesthetic stimulation";
    } else if (scores.extraversion > 0.6) {
      return "music as social and energetic enhancement";
    } else {
      return "a balanced, intuitive approach to musical emotional support";
    }
  }

  getOrganizationalStyle(metadata, playlist) {
    const avgTrackLength = metadata.averageTrackLength / 1000; // Convert to seconds
    const trackCount = playlist.trackCount;
    
    if (trackCount > 50 && avgTrackLength > 240) {
      return "Your substantial playlist with longer tracks suggests patient, immersive listening habits.";
    } else if (trackCount > 30) {
      return "Your comprehensive playlist curation indicates thoughtful musical organization.";
    } else {
      return "Your focused playlist suggests selective, quality-over-quantity curation.";
    }
  }

  getSocialContext(scores) {
    if (scores.agreeableness > 0.7 && scores.extraversion > 0.5) {
      return "a socially-minded musical curator who considers both personal taste and group dynamics";
    } else if (scores.openness > 0.7) {
      return "an artistic individualist who uses music for personal exploration and aesthetic development";
    } else {
      return "someone who maintains clear personal musical boundaries while remaining open to new experiences";
    }
  }

  analyzeTemporalPattern(decades) {
    const decadeEntries = Object.entries(decades).sort(([,a], [,b]) => b - a);
    if (decadeEntries.length === 0) return "Your temporal music preferences show interesting patterns.";
    
    const [topDecade, count] = decadeEntries[0];
    const totalTracks = Object.values(decades).reduce((a, b) => a + b, 0);
    const dominance = count / totalTracks;
    
    if (dominance > 0.5) {
      return `Your strong preference for ${topDecade}s music (${Math.round(dominance * 100)}% of tracks) suggests either nostalgic connection or aesthetic alignment with that era's sound.`;
    } else {
      return `Your cross-era musical taste spans ${decadeEntries.length} decades, indicating temporal flexibility and resistance to being confined by generational musical boundaries.`;
    }
  }

  calculateExpertiseLevel(metadata) {
    const artistDiversity = metadata.artistCount;
    const avgPopularity = metadata.popularityRange?.average || 50;
    
    if (artistDiversity > 20 && avgPopularity < 60) {
      return "expert-level musical knowledge";
    } else if (artistDiversity > 15) {
      return "sophisticated musical awareness";
    } else {
      return "focused musical expertise";
    }
  }

  findPersonalityConflicts(scores) {
    if (scores.openness > 0.7 && scores.conscientiousness > 0.6) {
      return "balances adventurous musical exploration with systematic organization - a rare combination of creative curiosity and methodical approach";
    } else if (scores.neuroticism > 0.5 && scores.agreeableness > 0.7) {
      return "combines emotional sensitivity with social consideration, using music both for personal processing and interpersonal connection";
    } else {
      return "maintains psychological consistency in musical choices, suggesting integrated personality expression through music";
    }
  }

  calculateNarrativeConfidence(data) {
    let confidence = 0.5; // Base confidence
    
    if (data.playlist.trackCount > 20) confidence += 0.2;
    if (data.metadata.artistCount > 10) confidence += 0.1;
    if (data.metadata.hasAudioFeatures) confidence += 0.2;
    
    return Math.min(0.95, confidence);
  }

  getHighestTraitInsight(scores) {
    const highest = Object.entries(scores).sort(([,a], [,b]) => b - a)[0];
    return `Dominant trait: ${highest[0]} (${Math.round(highest[1] * 100)}%)`;
  }

  getArtistPatternInsight(topArtists) {
    if (topArtists.length === 0) return "Artist analysis unavailable";
    return `Artist focus: ${topArtists[0].name} leads with ${topArtists[0].count} tracks`;
  }

  getPopularityInsight(avgPopularity) {
    return `Popularity preference: ${avgPopularity}/100 (${avgPopularity > 60 ? 'mainstream-leaning' : 'underground-oriented'})`;
  }

  extractKeyInsights(narrative) {
    // Simple extraction for key insights from generated narrative
    const sentences = narrative.split('. ');
    return sentences.slice(0, 3).map(s => s.trim());
  }
}

module.exports = { MusicPsychologyNarrator };