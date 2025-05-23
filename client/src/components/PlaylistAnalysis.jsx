import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function PlaylistAnalysis({ playlistId, playlistName, onBack }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (playlistId) {
      analyzePlaylist();
    }
  }, [playlistId]);

  const analyzePlaylist = async () => {
    const token = localStorage.getItem('spotify_access_token');
    
    if (!token) {
      setError('No access token found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Starting analysis for playlist:', playlistId);
      
      const response = await fetch(`http://127.0.0.1:5000/api/analysis/playlist/${playlistId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const analysisData = await response.json();
      console.log('📊 Analysis data received:', analysisData);
      setAnalysis(analysisData);
      console.log('✅ State updated with analysis data');
    } catch (err) {
      console.error('❌ Analysis error:', err);
      setError(`Failed to analyze playlist: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getFeatureColor = (value) => {
    if (value > 0.7) return '#1db954'; // Green for high values
    if (value > 0.4) return '#ffa500'; // Orange for medium values
    return '#ff6b6b'; // Red for low values
  };

  const formatDuration = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (loading) {
    console.log('🔄 Still loading analysis...');
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Analyzing "{playlistName}"...</h2>
        <p>🎵 Fetching tracks and audio features...</p>
        <p>📊 This may take a few moments for large playlists</p>
      </div>
    );
  }

  if (error) {
    console.log('❌ Error state:', error);
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Analysis Error</h2>
        <p style={{ color: '#ff6b6b' }}>{error}</p>
        <button onClick={onBack} style={{ marginTop: '10px', padding: '10px 20px' }}>
          Back to Playlists
        </button>
      </div>
    );
  }

  if (!analysis) {
    console.log('⚠️ No analysis data available');
    return <div>No analysis data available</div>;
  }

  console.log('🎨 Rendering analysis for:', analysis.playlist?.name);
//DEBUG LINE
console.log('🎨 Rendering analysis for:', analysis.playlist?.name);
console.log('🔍 Temporal flow debug:', {
  hasTemporalFlow: !!analysis.temporalFlowAnalysis,
  flowAvailable: analysis.temporalFlowAnalysis?.flow_analysis?.flow_available,
  fullFlowData: analysis.temporalFlowAnalysis
}); // <-- ADD THIS DEBUG LINE

  const { playlist, audioFeatures, tasteProfile, popularity, decades } = analysis;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button 
          onClick={onBack}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f0f0f0',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
        <div>
          <h1 style={{ margin: '0' }}>Analysis: {playlist.name}</h1>
          <p style={{ margin: '5px 0', color: '#666' }}>
            {playlist.trackCount} tracks • {formatDuration(playlist.totalDuration)}
          </p>
        </div>
      </div>

      {/* Taste Profile Summary */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '25px',
        borderRadius: '10px',
        marginBottom: '30px',
        border: '2px solid #1db954'
      }}>
        <h2 style={{ marginTop: '0', color: '#1db954' }}>🎯 Taste Profile</h2>
        <h3 style={{ fontSize: '1.4em', marginBottom: '15px' }}>{tasteProfile.summary}</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <strong>Mood:</strong> {tasteProfile.mood}
          </div>
          <div>
            <strong>Energy:</strong> {tasteProfile.energy}
          </div>
          <div>
            <strong>Danceability:</strong> {tasteProfile.danceability}
          </div>
        </div>
      </div>
	  
	  {/* Psychological Profile */}
      {analysis.psychologyProfile && (
  <div style={{ marginBottom: '30px' }}>
    <h2>🧠 Psychological Profile</h2>
    <div style={{
      backgroundColor: '#f0f8ff',
      padding: '25px',
      borderRadius: '10px',
      marginBottom: '20px',
      border: '2px solid #4a90e2'
    }}>
      <h3 style={{ marginTop: '0', color: '#4a90e2' }}>
        {analysis.psychologyProfile.summary}
      </h3>
      
      {/* Big Five Scores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        {Object.entries(analysis.psychologyProfile.scores).map(([trait, score]) => (
          <div key={trait} style={{
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{ marginTop: '0', textTransform: 'capitalize' }}>{trait}</h4>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              marginBottom: '8px'
            }}>
              <div style={{
                width: `${Math.round(score * 100)}%`,
                height: '100%',
                backgroundColor: '#4a90e2',
                borderRadius: '4px'
              }}></div>
            </div>
            <p style={{ margin: '0', fontSize: '14px', fontWeight: 'bold' }}>
              {Math.round(score * 100)}%
            </p>
          </div>
        ))}
      </div>

{/* Advanced AI Narrative */}
{analysis.advancedNarrative && (
  <div style={{ marginBottom: '30px' }}>
    <h2>🤖 Advanced Psychological Analysis</h2>
    <div style={{
      backgroundColor: '#f0f4f8',
      padding: '30px',
      borderRadius: '12px',
      marginBottom: '20px',
      border: '2px solid #667eea',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0', color: '#667eea' }}>
          AI-Generated Musical Psychology Profile
        </h3>
        <span style={{
          backgroundColor: '#667eea',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {analysis.advancedNarrative.narrative_type === 'LLM_Generated' ? 'AI-Powered' : 'Advanced Analysis'}
        </span>
      </div>
      
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '8px',
        lineHeight: '1.7',
        fontSize: '16px',
        color: '#2d3748'
      }}>
        {analysis.advancedNarrative.advanced_narrative.split('\n\n').map((paragraph, index) => (
          <p key={index} style={{ marginBottom: '20px', margin: index === 0 ? '0 0 20px 0' : '20px 0' }}>
            {paragraph}
          </p>
        ))}
      </div>

      {/* Key Insights */}
      {analysis.advancedNarrative.key_insights && (
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ color: '#667eea', marginBottom: '15px' }}>Key Insights:</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
            {analysis.advancedNarrative.key_insights.map((insight, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '14px'
              }}>
                💡 {insight}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confidence Score */}
      <div style={{ 
        marginTop: '20px', 
        textAlign: 'center',
        fontSize: '14px',
        color: '#718096'
      }}>
        Analysis Confidence: {Math.round((analysis.advancedNarrative.confidence_score || 0.5) * 100)}% • 
        Generated: {new Date(analysis.advancedNarrative.generated_at).toLocaleString()}
      </div>
    </div>
  </div>
)}

      {/* Detailed Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
        {Object.entries(analysis.psychologyProfile.insights).map(([trait, insights]) => 
          insights.length > 0 && (
            <div key={trait} style={{
              backgroundColor: 'white',
              padding: '15px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h5 style={{ margin: '0 0 10px 0', color: '#4a90e2', textTransform: 'capitalize' }}>
                {trait} Insights:
              </h5>
              {insights.map((insight, index) => (
                <p key={index} style={{ margin: '5px 0', fontSize: '14px' }}>
                  • {insight}
                </p>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  </div>
)}

      {/* Audio Features or Alternative Analysis */}
      {analysis.metadata?.hasAudioFeatures && audioFeatures && audioFeatures.averages ? (
        <div style={{ marginBottom: '30px' }}>
          <h2>🎼 Audio Features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {Object.entries(audioFeatures.averages).map(([feature, value]) => {
              if (['tempo', 'loudness'].includes(feature)) return null;
              
              const percentage = Math.round(value * 100);
              const color = getFeatureColor(value);
              
              return (
                <div key={feature} style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <h4 style={{ marginTop: '0', textTransform: 'capitalize' }}>{feature}</h4>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: color,
                      borderRadius: '4px'
                    }}></div>
                  </div>
                  <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color }}>
                    {percentage}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '30px' }}>
          <h2>🎵 Track Analysis</h2>
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>ℹ️ Limited Analysis Available</h4>
            <p style={{ margin: '0', color: '#856404' }}>
              {tasteProfile.note || "Audio features not available - showing analysis based on track metadata."}
            </p>
          </div>
          
          {/* Show alternative insights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h4>Average Popularity</h4>
              <p style={{ fontSize: '24px', margin: '0', color: '#1db954' }}>
                {popularity.average}/100
              </p>
            </div>
            
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h4>Explicit Content</h4>
              <p style={{ fontSize: '24px', margin: '0', color: '#1db954' }}>
                {analysis.metadata?.explicitPercentage || 0}%
              </p>
            </div>
            
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h4>Average Track Length</h4>
              <p style={{ fontSize: '24px', margin: '0', color: '#1db954' }}>
                {formatDuration(analysis.metadata?.averageTrackLength || 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tempo and Technical Details - only show if we have audio features */}
      {analysis.metadata?.hasAudioFeatures && audioFeatures && audioFeatures.averages && (
        <div style={{ marginBottom: '30px' }}>
          <h2>🎵 Technical Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h4>Average Tempo</h4>
              <p style={{ fontSize: '24px', margin: '0', color: '#1db954' }}>
                {Math.round(audioFeatures.averages.tempo)} BPM
              </p>
            </div>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h4>Average Loudness</h4>
              <p style={{ fontSize: '24px', margin: '0', color: '#1db954' }}>
                {Math.round(audioFeatures.averages.loudness)} dB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Artists */}
      {analysis.topArtists && analysis.topArtists.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2>🎤 Top Artists</h2>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              {analysis.topArtists.slice(0, 6).map((artist, index) => (
                <div key={artist.name} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: index < 5 ? '1px solid #eee' : 'none'
                }}>
                  <span style={{ fontWeight: '500' }}>{artist.name}</span>
                  <span style={{ 
                    backgroundColor: '#1db954', 
                    color: 'white', 
                    padding: '2px 8px', 
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {artist.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Popularity Distribution */}
      <div style={{ marginBottom: '30px' }}>
        <h2>📈 Popularity Analysis</h2>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3>Average Popularity: {popularity.average}/100</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginTop: '15px' }}>
            {Object.entries(popularity.distribution).map(([range, count]) => (
              <div key={range} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', marginBottom: '5px' }}>{range}</div>
                <div style={{
                  height: `${Math.max(count * 3, 10)}px`,
                  backgroundColor: '#1db954',
                  borderRadius: '2px'
                }}></div>
                <div style={{ fontSize: '12px', marginTop: '5px' }}>{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
  
{analysis.temporalFlowAnalysis && analysis.temporalFlowAnalysis.flow_analysis.flow_available !== false && (
  <div style={{ marginBottom: '30px' }}>
    <h2>🎼 Musical Journey Analysis</h2>
    <div style={{
      backgroundColor: '#f8f4f0',
      padding: '30px',
      borderRadius: '12px',
      marginBottom: '20px',
      border: '2px solid #ff6b35',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ marginTop: '0', color: '#ff6b35' }}>
        Your Playlist Flow & Pacing Strategy
      </h3>

      {/* Flow Quality Score */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '25px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px'
      }}>
        <div style={{ marginRight: '20px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: analysis.temporalFlowAnalysis.insights?.flow_quality_score > 0.7 ? '#4CAF50' : 
                           analysis.temporalFlowAnalysis.insights?.flow_quality_score > 0.4 ? '#FF9800' : '#F44336',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            {Math.round((analysis.temporalFlowAnalysis.insights?.flow_quality_score || 0.5) * 100)}%
          </div>
        </div>
        <div>
          <h4 style={{ margin: '0', color: '#ff6b35' }}>Flow Quality Score</h4>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>
            Measures how well your tracks flow together as an intentional journey
          </p>
        </div>
      </div>

      {/* Energy Flow Visualization */}
      {analysis.temporalFlowAnalysis.visualization_data && (
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ color: '#ff6b35', marginBottom: '15px' }}>Energy Flow Curve</h4>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            position: 'relative',
            height: '120px'
          }}>
            <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
              {/* Draw energy curve */}
              {analysis.temporalFlowAnalysis.visualization_data.energy_points && 
               analysis.temporalFlowAnalysis.visualization_data.energy_points.length > 1 && (
                <polyline
                  points={analysis.temporalFlowAnalysis.visualization_data.energy_points
                    .map((point, index) => 
                      `${(index / (analysis.temporalFlowAnalysis.visualization_data.energy_points.length - 1)) * 100}%,${100 - point.value * 80}%`
                    ).join(' ')}
                  fill="none"
                  stroke="#ff6b35"
                  strokeWidth="3"
                  style={{ vectorEffect: 'non-scaling-stroke' }}
                />
              )}
              
              {/* Add axis labels */}
              <text x="0%" y="95%" fontSize="12" fill="#666">Start</text>
              <text x="95%" y="95%" fontSize="12" fill="#666" textAnchor="end">End</text>
              <text x="0%" y="15%" fontSize="12" fill="#666">High Energy</text>
              <text x="0%" y="85%" fontSize="12" fill="#666">Low Energy</text>
            </svg>
          </div>
        </div>
      )}

      {/* Flow Insights */}
      {analysis.temporalFlowAnalysis.insights?.flow_insights && (
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ color: '#ff6b35', marginBottom: '15px' }}>Flow Insights</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
            {analysis.temporalFlowAnalysis.insights.flow_insights.map((insight, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                borderLeft: '4px solid #ff6b35'
              }}>
                <p style={{ margin: '0', fontSize: '16px', lineHeight: '1.5' }}>
                  🎯 {insight}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DJ Skill Analysis */}
      {analysis.temporalFlowAnalysis.insights?.dj_skill_analysis && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ color: '#ff6b35', marginBottom: '15px' }}>Curation Skills Analysis</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{
              backgroundColor: 'white',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h5 style={{ margin: '0 0 8px 0', color: '#ff6b35' }}>Transition Mastery</h5>
              <p style={{ 
                margin: '0', 
                fontSize: '18px', 
                fontWeight: 'bold',
                textTransform: 'capitalize'
              }}>
                {analysis.temporalFlowAnalysis.insights.dj_skill_analysis.transition_mastery}
              </p>
            </div>
            <div style={{
              backgroundColor: 'white',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h5 style={{ margin: '0 0 8px 0', color: '#ff6b35' }}>Pacing Style</h5>
              <p style={{ 
                margin: '0', 
                fontSize: '18px', 
                fontWeight: 'bold',
                textTransform: 'capitalize'
              }}>
                {analysis.temporalFlowAnalysis.insights.dj_skill_analysis.pacing_sophistication}
              </p>
            </div>
            <div style={{
              backgroundColor: 'white',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h5 style={{ margin: '0 0 8px 0', color: '#ff6b35' }}>Overall Skill</h5>
              <p style={{ 
                margin: '0', 
                fontSize: '18px', 
                fontWeight: 'bold',
                textTransform: 'capitalize'
              }}>
                {analysis.temporalFlowAnalysis.insights.dj_skill_analysis.overall_skill}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Narrative Structure */}
      {analysis.temporalFlowAnalysis.insights?.narrative_structure && (
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#ff6b35' }}>Playlist Structure</h5>
          <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
            📖 Your playlist follows a <strong>{analysis.temporalFlowAnalysis.insights.narrative_structure}</strong> structure
          </p>
        </div>
      )}
    </div>
  </div>
)}

      {/* Era Distribution */}
      {Object.keys(decades).length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2>📅 Era Distribution</h2>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {Object.entries(decades)
                .sort(([a], [b]) => parseInt(b) - parseInt(a))
                .map(([decade, count]) => (
                <div key={decade} style={{
                  padding: '8px 16px',
                  backgroundColor: '#1db954',
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '14px'
                }}>
                  {decade}s: {count} tracks
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Analysis Type Info */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{
          backgroundColor: '#e3f2fd',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #2196f3'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>
            📊 Analysis Type: {analysis.analysis?.analysisType || 'Metadata Analysis'}
          </h4>
          <p style={{ margin: '0', fontSize: '14px', color: '#1976d2' }}>
            Analyzed {analysis.analysis?.trackCount || 0} tracks • 
            Generated on {new Date(analysis.analysis?.timestamp || Date.now()).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button 
          onClick={() => alert('Coming soon: Generate recommendations based on this analysis!')}
          style={{
            backgroundColor: '#1db954',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '25px',
            fontSize: '16px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Generate Similar Recommendations
        </button>
        <button 
          onClick={onBack}
          style={{
            backgroundColor: '#666',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '25px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Analyze Another Playlist
        </button>
      </div>
    </div>
  );
}

export default PlaylistAnalysis;