import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function SpotifyCallback() {
  const [status, setStatus] = useState('Processing...');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const expiresIn = urlParams.get('expires_in');

    if (accessToken) {
      // Store tokens in localStorage (temporary solution)
      localStorage.setItem('spotify_access_token', accessToken);
      localStorage.setItem('spotify_refresh_token', refreshToken);
      localStorage.setItem('spotify_token_expires', Date.now() + (expiresIn * 1000));
      
      setStatus('Success! Redirecting to dashboard...');
      
      // Redirect to main app after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } else {
      setStatus('Error: No access token received');
    }
  }, [location, navigate]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Spotify Authentication</h2>
      <p>{status}</p>
      {status.includes('Error') && (
        <button onClick={() => navigate('/')}>
          Back to Home
        </button>
      )}
    </div>
  );
}

export default SpotifyCallback;