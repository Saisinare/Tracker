import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-indigo-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-white font-bold text-xl">
                            Tracker.io
                        </Link>
                        <div className="hidden md:block ml-10">
                            <div className="flex items-baseline space-x-4">
                                <Link
                                    to="/"
                                    className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    My Playlists
                                </Link>
                                <Link
                                    to="/playlists/new"
                                    className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Add Playlist
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="hidden md:block">
                            <div className="flex items-center">
                                <span className="text-white mr-4">
                                    Welcome, {user?.username}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                        <div className="md:hidden">
                            {/* Mobile menu button */}
                            <button className="text-white hover:bg-indigo-500 p-2 rounded-md">
                                <svg
                                    className="h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Mobile menu */}
            <div className="md:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <Link
                        to="/"
                        className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium"
                    >
                        My Playlists
                    </Link>
                    <Link
                        to="/playlists/new"
                        className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium"
                    >
                        Add Playlist
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="text-white hover:bg-indigo-500 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 