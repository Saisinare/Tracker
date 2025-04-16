import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Playlist {
  _id: string;
  title: string;
  youtubeUrl: string;
  videos: any[];
  createdAt: string;
}

const PlaylistList: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/playlists');
        setPlaylists(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching playlists:', error);
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  const calculateProgress = (videos: any[]) => {
    if (videos.length === 0) return 0;
    const completed = videos.filter(video => video.isCompleted).length;
    return Math.round((completed / videos.length) * 100);
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Playlists</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((playlist) => (
          <Link
            key={playlist._id}
            to={`/playlists/${playlist._id}`}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {playlist.title}
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              {playlist.videos.length} videos
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${calculateProgress(playlist.videos)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {calculateProgress(playlist.videos)}% completed
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PlaylistList; 