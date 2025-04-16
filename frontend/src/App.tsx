import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import PlaylistList from './components/PlaylistList';
import PlaylistDetail from './components/PlaylistDetail';
import AddPlaylist from './components/AddPlaylist';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-gray-100">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <>
                                        <Navbar />
                                        <div className="container mx-auto px-4 py-8">
                                            <PlaylistList />
                                        </div>
                                    </>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/playlists/new"
                            element={
                                <ProtectedRoute>
                                    <>
                                        <Navbar />
                                        <div className="container mx-auto px-4 py-8">
                                            <AddPlaylist />
                                        </div>
                                    </>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/playlists/:id"
                            element={
                                <ProtectedRoute>
                                    <>
                                        <Navbar />
                                        <div className="container mx-auto px-4 py-8">
                                            <PlaylistDetail />
                                        </div>
                                    </>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
};

export default App; 