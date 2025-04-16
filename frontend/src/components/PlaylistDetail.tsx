import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Video {
  _id: string;
  title: string;
  youtubeId: string;
  isCompleted: boolean;
  notes: string;
  order: number;
}

interface Playlist {
  _id: string;
  title: string;
  youtubeUrl: string;
  videos: Video[];
}

const PlaylistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/playlists/${id}`);
        setPlaylist(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching playlist:', error);
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [id]);

  const handleVideoStatusChange = async (videoId: string, isCompleted: boolean) => {
    try {
      await axios.put(`http://localhost:5000/api/videos/${videoId}`, {
        isCompleted,
      });
      setPlaylist((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          videos: prev.videos.map((video) =>
            video._id === videoId ? { ...video, isCompleted } : video
          ),
        };
      });
    } catch (error) {
      console.error('Error updating video status:', error);
    }
  };

  const handleNoteEdit = (videoId: string, currentNote: string) => {
    setEditingNote(videoId);
    setNoteText(currentNote);
  };

  const handleNoteSave = async (videoId: string) => {
    try {
      await axios.put(`http://localhost:5000/api/videos/${videoId}`, {
        notes: noteText,
      });
      setPlaylist((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          videos: prev.videos.map((video) =>
            video._id === videoId ? { ...video, notes: noteText } : video
          ),
        };
      });
      setEditingNote(null);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleDeletePlaylist = async () => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      try {
        await axios.delete(`http://localhost:5000/api/playlists/${id}`);
        navigate('/');
      } catch (error) {
        console.error('Error deleting playlist:', error);
      }
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!playlist) {
    return <div className="text-center">Playlist not found</div>;
  }

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

      <div className="bg-white shadow rounded-lg">
        <ul className="divide-y divide-gray-200">
          {playlist.videos.map((video) => (
            <li key={video._id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={video.isCompleted}
                    onChange={(e) => handleVideoStatusChange(video._id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-900">{video.title}</span>
                </div>
                <div className="flex items-center space-x-4">
                  {editingNote === video._id ? (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleNoteSave(video._id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleNoteEdit(video._id, video.notes)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {video.notes ? 'Edit Note' : 'Add Note'}
                    </button>
                  )}
                </div>
              </div>
              {video.notes && editingNote !== video._id && (
                <div className="mt-2 text-sm text-gray-600">{video.notes}</div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PlaylistDetail; 