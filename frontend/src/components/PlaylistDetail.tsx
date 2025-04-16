import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlaylist, updateVideoStatus, deletePlaylist } from '../utils/api';
import { Playlist } from '../types';

const PlaylistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!id) return;
      
      try {
        const response = await getPlaylist(id);
        setPlaylist(response.data);
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching playlist:', error);
        setError(error.response?.data?.message || 'Failed to fetch playlist');
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [id]);

  const handleVideoStatusUpdate = async (videoId: string, isCompleted: boolean, notes?: string) => {
    if (!playlist || !id) return;
    
    try {
      const response = await updateVideoStatus(id, videoId, isCompleted, notes);
      setPlaylist(response.data);
    } catch (error: any) {
      console.error('Error updating video status:', error);
      setError(error.response?.data?.message || 'Failed to update video status');
    }
  };

  const handleDeletePlaylist = async () => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      try {
        await deletePlaylist(id);
        navigate('/');
      } catch (error: any) {
        console.error('Error deleting playlist:', error);
        setError(error.response?.data?.message || 'Failed to delete playlist');
      }
    }
  };

  const openYouTubeVideo = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

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

  if (!playlist) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600">Playlist not found</div>
      </div>
    );
  }

  // Calculate completion percentage
  const completedVideos = playlist.videos.filter(video => video.isCompleted).length;
  const totalVideos = playlist.videos.length;
  const completionPercentage = totalVideos > 0 
    ? Math.round((completedVideos / totalVideos) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{playlist.title}</h1>
        <button
          onClick={handleDeletePlaylist}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
        >
          Delete Playlist
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-4">
        <div className="mb-2 flex justify-between">
          <span className="text-sm font-medium text-gray-700">Progress: {completionPercentage}%</span>
          <span className="text-sm text-gray-500">{completedVideos} of {totalVideos} completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <ul className="divide-y divide-gray-200">
          {playlist.videos.map((video) => (
            <li key={video.videoId} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={video.isCompleted}
                    onChange={(e) => handleVideoStatusUpdate(video.videoId, e.target.checked, video.notes)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span 
                    className="text-gray-900 cursor-pointer hover:text-blue-600 hover:underline"
                    onClick={() => openYouTubeVideo(video.videoId)}
                  >
                    {video.title}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <textarea
                    placeholder="Add notes..."
                    value={video.notes || ''}
                    onChange={(e) => handleVideoStatusUpdate(video.videoId, video.isCompleted, e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PlaylistDetail; 