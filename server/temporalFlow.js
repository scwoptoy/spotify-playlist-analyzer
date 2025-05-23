// Temporal Flow Analysis Engine - Musical Journey Architect
// Analyzes playlists as emotional journeys with intentional flow and pacing

class TemporalFlowAnalyzer {
  constructor() {
    this.energyThresholds = {
      low: 0.3,
      medium: 0.6,
      high: 0.8
    };
    
    this.valenceThresholds = {
      negative: 0.3,
      neutral: 0.6,
      positive: 0.8
    };
  }

  analyzePlaylistFlow(tracks, audioFeatures) {
    try {
      console.log(`🎼 Starting temporal flow analysis for ${tracks.length} tracks...`);

      if (!audioFeatures || audioFeatures.length === 0) {
        return this.generateMetadataFlowAnalysis(tracks);
      }

      // Core temporal analysis
      const energyCurve = this.calculateEnergyCurve(audioFeatures);
      const valenceCurve = this.calculateValenceCurve(audioFeatures);
      const tempoFlow = this.calculateTempoFlow(audioFeatures);
      
      // Advanced flow patterns
      const flowStructure = this.detectFlowStructure(energyCurve, valenceCurve);
      const transitions = this.analyzeTransitions(audioFeatures);
      const emotionalArcs = this.detectEmotionalArcs(energyCurve, valenceCurve);
      const pacingStrategy = this.analyzePacingStrategy(energyCurve, tempoFlow);
      
      // Generate insights
      const flowInsights = this.generateFlowInsights(flowStructure, transitions, emotionalArcs, pacingStrategy);
      const narrativeStructure = this.detectNarrativeStructure(energyCurve, valenceCurve, tracks.length);
      const djSkillAnalysis = this.analyzeDJSkills(transitions, pacingStrategy);

      console.log(`✅ Temporal flow analysis complete`);

      return {
        flow_analysis: {
          energy_curve: energyCurve,
          valence_curve: valenceCurve,
          tempo_flow: tempoFlow,
          flow_structure: flowStructure,
          emotional_arcs: emotionalArcs,
          transitions: transitions,
          pacing_strategy: pacingStrategy
        },
        insights: {
          flow_insights: flowInsights,
          narrative_structure: narrativeStructure,
          dj_skill_analysis: djSkillAnalysis,
          flow_quality_score: this.calculateFlowQualityScore(transitions, emotionalArcs),
          curator_personality: this.inferCuratorPersonality(flowStructure, pacingStrategy)
        },
        visualization_data: {
          energy_points: energyCurve.points,
          valence_points: valenceCurve.points,
          flow_segments: flowStructure.segments,
          transition_quality: transitions.quality_points
        }
      };

    } catch (error) {
      console.error('❌ Temporal flow analysis error:', error);
      return this.generateBasicFlowAnalysis(tracks);
    }
  }

  calculateEnergyCurve(audioFeatures) {
    const energyValues = audioFeatures.map(af => af.energy);
    const points = energyValues.map((energy, index) => ({
      position: index,
      value: energy,
      percentage: (index / (energyValues.length - 1)) * 100
    }));

    // Detect energy patterns
    const peaks = this.findPeaks(energyValues);
    const valleys = this.findValleys(energyValues);
    const trend = this.calculateTrend(energyValues);
    
    return {
      points,
      peaks,
      valleys,
      trend,
      average: energyValues.reduce((a, b) => a + b, 0) / energyValues.length,
      variance: this.calculateVariance(energyValues),
      range: Math.max(...energyValues) - Math.min(...energyValues)
    };
  }

  calculateValenceCurve(audioFeatures) {
    const valenceValues = audioFeatures.map(af => af.valence);
    const points = valenceValues.map((valence, index) => ({
      position: index,
      value: valence,
      percentage: (index / (valenceValues.length - 1)) * 100
    }));

    return {
      points,
      peaks: this.findPeaks(valenceValues),
      valleys: this.findValleys(valenceValues),
      trend: this.calculateTrend(valenceValues),
      average: valenceValues.reduce((a, b) => a + b, 0) / valenceValues.length,
      emotional_journey: this.mapEmotionalJourney(valenceValues)
    };
  }

  calculateTempoFlow(audioFeatures) {
    const tempoValues = audioFeatures.map(af => af.tempo);
    const normalizedTempo = tempoValues.map(tempo => tempo / 200); // Normalize to 0-1 range
    
    return {
      values: tempoValues,
      normalized: normalizedTempo,
      average: tempoValues.reduce((a, b) => a + b, 0) / tempoValues.length,
      consistency: 1 - this.calculateVariance(normalizedTempo),
      tempo_shifts: this.detectTempoShifts(tempoValues)
    };
  }

  detectFlowStructure(energyCurve, valenceCurve) {
    const trackCount = energyCurve.points.length;
    const segments = this.segmentPlaylist(energyCurve.points, valenceCurve.points);
    
    // Detect structural patterns
    const structure = this.classifyPlaylistStructure(segments);
    const climax = this.findClimax(energyCurve.points, valenceCurve.points);
    const acts = this.detectActs(segments, trackCount);

    return {
      segments,
      structure_type: structure,
      climax_position: climax,
      acts,
      opening_strategy: this.analyzeOpening(segments[0]),
      closing_strategy: this.analyzeClosing(segments[segments.length - 1])
    };
  }

  analyzeTransitions(audioFeatures) {
    const transitions = [];
    let totalQuality = 0;

    for (let i = 0; i < audioFeatures.length - 1; i++) {
      const current = audioFeatures[i];
      const next = audioFeatures[i + 1];
      
      const transition = this.analyzeTransition(current, next, i);
      transitions.push(transition);
      totalQuality += transition.quality_score;
    }

    return {
      transitions,
      average_quality: totalQuality / transitions.length,
      smooth_transitions: transitions.filter(t => t.quality_score > 0.7).length,
      jarring_transitions: transitions.filter(t => t.quality_score < 0.3).length,
      quality_points: transitions.map((t, i) => ({
        position: i,
        quality: t.quality_score
      }))
    };
  }

  analyzeTransition(current, next, position) {
    // Analyze multiple dimensions of transition quality
    const energyDiff = Math.abs(current.energy - next.energy);
    const valenceDiff = Math.abs(current.valence - next.valence);
    const tempoDiff = Math.abs(current.tempo - next.tempo) / 200; // Normalize
    const keyCompatibility = this.analyzeKeyCompatibility(current.key, next.key);
    
    // Calculate overall transition quality (0-1 scale)
    const energyScore = 1 - Math.min(energyDiff, 1);
    const valenceScore = 1 - Math.min(valenceDiff, 1);
    const tempoScore = 1 - Math.min(tempoDiff, 1);
    
    const qualityScore = (energyScore * 0.4 + valenceScore * 0.3 + tempoScore * 0.2 + keyCompatibility * 0.1);

    return {
      position,
      quality_score: qualityScore,
      energy_change: next.energy - current.energy,
      valence_change: next.valence - current.valence,
      tempo_change: next.tempo - current.tempo,
      transition_type: this.classifyTransition(energyDiff, valenceDiff, tempoDiff)
    };
  }

  detectEmotionalArcs(energyCurve, valenceCurve) {
    const arcs = [];
    const combinedCurve = energyCurve.points.map((point, i) => ({
      position: i,
      energy: point.value,
      valence: valenceCurve.points[i].value,
      emotional_intensity: (point.value + valenceCurve.points[i].value) / 2
    }));

    // Find emotional arc patterns
    let currentArc = null;
    let arcStart = 0;

    for (let i = 1; i < combinedCurve.length; i++) {
      const prev = combinedCurve[i - 1];
      const curr = combinedCurve[i];
      
      const intensityChange = curr.emotional_intensity - prev.emotional_intensity;
      
      if (Math.abs(intensityChange) > 0.1) { // Significant change
        if (currentArc && this.isArcComplete(currentArc, intensityChange)) {
          arcs.push({
            ...currentArc,
            end_position: i - 1,
            duration: (i - 1) - arcStart
          });
          arcStart = i - 1;
        }
        
        currentArc = {
          start_position: arcStart,
          direction: intensityChange > 0 ? 'rising' : 'falling',
          intensity: Math.abs(intensityChange),
          type: this.classifyArcType(prev, curr)
        };
      }
    }

    return {
      arcs,
      arc_count: arcs.length,
      dominant_pattern: this.findDominantArcPattern(arcs),
      emotional_complexity: this.calculateEmotionalComplexity(arcs)
    };
  }

  analyzePacingStrategy(energyCurve, tempoFlow) {
    const energyChanges = [];
    for (let i = 1; i < energyCurve.points.length; i++) {
      energyChanges.push(energyCurve.points[i].value - energyCurve.points[i - 1].value);
    }

    const pacingMetrics = {
      change_frequency: energyChanges.filter(change => Math.abs(change) > 0.1).length,
      average_change_magnitude: energyChanges.reduce((sum, change) => sum + Math.abs(change), 0) / energyChanges.length,
      tempo_consistency: tempoFlow.consistency,
      pacing_style: this.classifyPacingStyle(energyChanges, tempoFlow.consistency)
    };

    return {
      ...pacingMetrics,
      pacing_personality: this.inferPacingPersonality(pacingMetrics),
      optimal_listening_context: this.suggestListeningContext(pacingMetrics)
    };
  }

  // Helper methods for calculations
  findPeaks(values, threshold = 0.1) {
    const peaks = [];
    for (let i = 1; i < values.length - 1; i++) {
      if (values[i] > values[i - 1] + threshold && values[i] > values[i + 1] + threshold) {
        peaks.push({ position: i, value: values[i] });
      }
    }
    return peaks;
  }

  findValleys(values, threshold = 0.1) {
    const valleys = [];
    for (let i = 1; i < values.length - 1; i++) {
      if (values[i] < values[i - 1] - threshold && values[i] < values[i + 1] - threshold) {
        valleys.push({ position: i, value: values[i] });
      }
    }
    return valleys;
  }

  calculateTrend(values) {
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumXX += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope > 0.01 ? 'rising' : slope < -0.01 ? 'falling' : 'stable';
  }

  calculateVariance(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    return squareDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  // Insight generation methods
  generateFlowInsights(flowStructure, transitions, emotionalArcs, pacingStrategy) {
    const insights = [];

    // Structure insights
    if (flowStructure.structure_type === 'three_act') {
      insights.push("You craft playlists with sophisticated three-act structure - like a movie soundtrack with clear beginning, development, and resolution");
    } else if (flowStructure.structure_type === 'gradual_build') {
      insights.push("You're a master of gradual energy building - creating sustained emotional momentum throughout your playlist");
    }

    // Transition insights
    if (transitions.average_quality > 0.7) {
      insights.push("Your transition mastery rivals professional DJs - each song flows seamlessly into the next");
    } else if (transitions.jarring_transitions > transitions.smooth_transitions) {
      insights.push("You prefer bold, contrasting musical statements - using jarring transitions for emotional impact");
    }

    // Pacing insights
    if (pacingStrategy.pacing_style === 'dynamic') {
      insights.push("Your dynamic pacing strategy keeps listeners engaged through strategic energy shifts and musical surprises");
    } else if (pacingStrategy.pacing_style === 'steady') {
      insights.push("You create immersive listening experiences through consistent pacing - perfect for flow states and deep focus");
    }

    return insights;
  }

  // Placeholder methods (to be implemented)
  segmentPlaylist(energyPoints, valencePoints) {
    // Divide playlist into meaningful segments based on energy/valence patterns
    const segments = [];
    const segmentSize = Math.max(3, Math.floor(energyPoints.length / 4));
    
    for (let i = 0; i < energyPoints.length; i += segmentSize) {
      const end = Math.min(i + segmentSize, energyPoints.length);
      segments.push({
        start: i,
        end: end,
        avg_energy: energyPoints.slice(i, end).reduce((sum, p) => sum + p.value, 0) / (end - i),
        avg_valence: valencePoints.slice(i, end).reduce((sum, p) => sum + p.value, 0) / (end - i)
      });
    }
    
    return segments;
  }

  classifyPlaylistStructure(segments) {
    if (segments.length >= 3) {
      return 'three_act';
    } else if (segments[0].avg_energy < segments[segments.length - 1].avg_energy) {
      return 'gradual_build';
    } else {
      return 'linear';
    }
  }

  classifyPacingStyle(energyChanges, tempoConsistency) {
    const changeFrequency = energyChanges.filter(change => Math.abs(change) > 0.1).length;
    const avgChange = energyChanges.reduce((sum, change) => sum + Math.abs(change), 0) / energyChanges.length;
    
    if (changeFrequency > energyChanges.length * 0.5 && avgChange > 0.15) {
      return 'dynamic';
    } else if (tempoConsistency > 0.8 && avgChange < 0.1) {
      return 'steady';
    } else {
      return 'balanced';
    }
  }

  generateBasicFlowAnalysis(tracks) {
    return {
      flow_analysis: {
        track_count: tracks.length,
        flow_available: false
      },
      insights: {
        flow_insights: ["Advanced flow analysis requires audio features - showing basic temporal patterns"],
        flow_quality_score: 0.5
      }
    };
  }

  generateMetadataFlowAnalysis(tracks) {
    // Analyze flow using metadata when audio features unavailable
    const durations = tracks.map(track => track.duration_ms);
    const popularities = tracks.map(track => track.popularity);
    
    return {
      flow_analysis: {
        duration_flow: this.analyzeDurationFlow(durations),
        popularity_flow: this.analyzePopularityFlow(popularities)
      },
      insights: {
        flow_insights: this.generateMetadataFlowInsights(durations, popularities),
        flow_quality_score: 0.6
      }
    };
  }

  // Additional helper methods
  analyzeKeyCompatibility(key1, key2) {
    // Simplified key compatibility (0-1 scale)
    if (key1 === key2) return 1;
    const keyDiff = Math.abs(key1 - key2);
    return Math.max(0, 1 - keyDiff / 6);
  }

  classifyTransition(energyDiff, valenceDiff, tempoDiff) {
    if (energyDiff < 0.1 && valenceDiff < 0.1 && tempoDiff < 0.1) return 'seamless';
    if (energyDiff > 0.3 || valenceDiff > 0.3) return 'contrasting';
    return 'smooth';
  }

  calculateFlowQualityScore(transitions, emotionalArcs) {
    const transitionScore = transitions.average_quality || 0.5;
    const arcScore = emotionalArcs.emotional_complexity ? Math.min(1, emotionalArcs.emotional_complexity / 10) : 0.5;
    return (transitionScore * 0.7 + arcScore * 0.3);
  }

  // Stub methods for complex analysis (can be expanded)
  mapEmotionalJourney(valenceValues) { return 'mixed_emotions'; }
  detectTempoShifts(tempoValues) { return []; }
  findClimax(energyPoints, valencePoints) { return Math.floor(energyPoints.length / 2); }
  detectActs(segments, trackCount) { return segments.length; }
  analyzeOpening(firstSegment) { return 'energetic'; }
  analyzeClosing(lastSegment) { return 'satisfying'; }
  isArcComplete(currentArc, intensityChange) { return true; }
  classifyArcType(prev, curr) { return 'emotional'; }
  findDominantArcPattern(arcs) { return 'varied'; }
  calculateEmotionalComplexity(arcs) { return arcs.length; }
  inferPacingPersonality(metrics) { return 'balanced'; }
  suggestListeningContext(metrics) { return 'versatile'; }
  inferCuratorPersonality(flowStructure, pacingStrategy) { return 'sophisticated'; }
  analyzeDurationFlow(durations) { return { average: durations.reduce((a,b) => a+b, 0) / durations.length }; }
  analyzePopularityFlow(popularities) { return { trend: 'stable' }; }
  generateMetadataFlowInsights(durations, popularities) { return ['Basic flow analysis from track metadata']; }
  analyzeDJSkills(transitions, pacingStrategy) { 
    return {
      transition_mastery: transitions.average_quality > 0.7 ? 'expert' : 'developing',
      pacing_sophistication: pacingStrategy.pacing_style,
      overall_skill: 'intermediate'
    };
  }
}

module.exports = { TemporalFlowAnalyzer };