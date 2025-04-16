import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllPlaylists } from '../utils/api';
import { Playlist } from '../types';

const PlaylistList: React.FC = () => {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const response = await getAllPlaylists();
                setPlaylists(response.data);
                setLoading(false);
            } catch (error: any) {
                console.error('Error fetching playlists:', error);
                setError(error.response?.data?.message || 'Failed to fetch playlists');
                setLoading(false);
            }
        };

        fetchPlaylists();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="text-red-600 mb-4">{error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="text-indigo-600 hover:text-indigo-800"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (playlists.length === 0) {
        return (
            <div className="text-center py-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">No playlists yet</h2>
                <Link
                    to="/playlists/new"
                    className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    Add your first playlist
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist) => (
                <Link
                    key={playlist._id}
                    to={`/playlists/${playlist._id}`}
                    className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                    <div className="aspect-w-16 aspect-h-9">
                        <img
                            src={playlist.thumbnailUrl}
                            alt={playlist.title}
                            className="object-cover rounded-t-lg w-full h-full"
                        />
                    </div>
                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{playlist.title}</h3>
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                {playlist.videos.length} videos
                            </div>
                            <div className="flex items-center">
                                <div className="w-20 bg-gray-200 rounded-full h-2.5 mr-2">
                                    <div
                                        className="bg-indigo-600 h-2.5 rounded-full"
                                        style={{ width: `${playlist.completionPercentage}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm text-gray-600">
                                    {playlist.completionPercentage}%
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default PlaylistList; 