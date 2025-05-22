import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SpotifyLogin from './components/SpotifyLogin';
import SpotifyCallback from './components/SpotifyCallback';
import PlaylistList from './components/PlaylistList';
import './App.css';

function Dashboard() {
  const accessToken = localStorage.getItem('spotify_access_token');
  
  if (!accessToken) {
    return <Navigate to="/" />;
  }

  return <PlaylistList />;
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