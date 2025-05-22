import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SpotifyLogin from './components/SpotifyLogin';
import SpotifyCallback from './components/SpotifyCallback';
import './App.css';

function Dashboard() {
  const accessToken = localStorage.getItem('spotify_access_token');
  
  if (!accessToken) {
    return <Navigate to="/" />;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <p>Welcome! You're connected to Spotify.</p>
      <p>Access Token: {accessToken.substring(0, 20)}...</p>
      <button onClick={() => {
        localStorage.clear();
        window.location.href = '/';
      }}>
        Logout
      </button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<SpotifyLogin />} />
          <Route path="/callback" element={<SpotifyCallback />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;