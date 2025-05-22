import { useState, useEffect } from 'react';

function PlaylistList() {
  const [playlists, setPlaylists] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('spotify_access_token');
    
    if (!token) {
      setError('No access token found');
      setLoading(false);
      return;
    }

    try {
      // Fetch both profile and playlists
      const [profileRes, playlistsRes] = await Promise.all([
        fetch('http://127.0.0.1:5000/api/spotify/profile', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://127.0.0.1:5000/api/spotify/playlists', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (!profileRes.ok || !playlistsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const profileData = await profileRes.json();
      const playlistsData = await playlistsRes.json();

      setProfile(profileData);
      setPlaylists(playlistsData.playlists);
    } catch (err) {
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzePlaylist = (playlistId, playlistName) => {
    alert(`Coming soon: Analyze "${playlistName}" (ID: ${playlistId})`);
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading your Spotify data...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => {
          localStorage.clear();
          window.location.href = '/';
        }}>
          Login Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* User Profile Header */}
      {profile && (
        <div style={{ 
          marginBottom: '30px', 
          padding: '20px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          {profile.images && profile.images[0] && (
            <img 
              src={profile.images[0].url} 
              alt="Profile" 
              style={{ width: '60px', height: '60px', borderRadius: '50%' }}
            />
          )}
          <div>
            <h2 style={{ margin: '0 0 5px 0' }}>Welcome, {profile.display_name}!</h2>
            <p style={{ margin: '0', color: '#666' }}>
              {profile.followers} followers • {playlists.length} playlists
            </p>
          </div>
        </div>
      )}

      {/* Playlists Grid */}
      <h3>Your Playlists</h3>
      {playlists.length === 0 ? (
        <p>No playlists found. Create some playlists in Spotify and refresh!</p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          {playlists.map((playlist) => (
            <div key={playlist.id} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {/* Playlist Image */}
              {playlist.images && playlist.images[0] && (
                <img 
                  src={playlist.images[0].url} 
                  alt={playlist.name}
                  style={{ 
                    width: '100%', 
                    height: '200px', 
                    objectFit: 'cover', 
                    borderRadius: '4px',
                    marginBottom: '10px'
                  }}
                />
              )}
              
              {/* Playlist Info */}
              <h4 style={{ margin: '0 0 8px 0' }}>{playlist.name}</h4>
              {playlist.description && (
                <p style={{ 
                  margin: '0 0 8px 0', 
                  color: '#666', 
                  fontSize: '14px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {playlist.description}
                </p>
              )}
              <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#888' }}>
                {playlist.tracks.total} tracks • by {playlist.owner.display_name}
              </p>
              
              {/* Analyze Button */}
              <button 
                onClick={() => handleAnalyzePlaylist(playlist.id, playlist.name)}
                style={{
                  backgroundColor: '#1db954',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  width: '100%'
                }}
              >
                Analyze This Playlist
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Logout Button */}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = '/';
          }}
          style={{
            backgroundColor: '#ff4444',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '20px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default PlaylistList;