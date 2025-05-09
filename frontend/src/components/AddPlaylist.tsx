import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPlaylist } from '../utils/api';

const AddPlaylist: React.FC = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createPlaylist(youtubeUrl);
      navigate('/');
    } catch (error: any) {
      console.error('Error adding playlist:', error);
      setError(error.response?.data?.message || 'Failed to add playlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Add New Playlist</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700">
            YouTube Playlist URL
          </label>
          <input
            type="url"
            id="youtubeUrl"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="https://www.youtube.com/playlist?list=..."
            required
          />
        </div>
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? 'Adding...' : 'Add Playlist'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPlaylist; 