import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PlaylistList from './components/PlaylistList';
import PlaylistDetail from './components/PlaylistDetail';
import AddPlaylist from './components/AddPlaylist';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<PlaylistList />} />
            <Route path="/playlists/new" element={<AddPlaylist />} />
            <Route path="/playlists/:id" element={<PlaylistDetail />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App; 