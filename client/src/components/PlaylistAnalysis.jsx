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