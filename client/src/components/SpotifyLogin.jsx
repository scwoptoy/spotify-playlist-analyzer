function SpotifyLogin() {
  const handleLogin = () => {
    // Redirect to our backend auth endpoint
    window.location.href = 'http://127.0.0.1:5000/auth/login';
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Spotify Playlist Analyzer</h1>
      <p>Analyze your playlists and discover new music!</p>
      <button 
        onClick={handleLogin}
        style={{
          backgroundColor: '#1db954',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '25px',
          fontSize: '16px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Connect with Spotify
      </button>
    </div>
  );
}

export default SpotifyLogin;