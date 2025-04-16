import axios from 'axios';
import { AuthResponse, User, Playlist } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth APIs
export const login = (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password });

export const signup = (username: string, email: string, password: string) =>
    api.post<AuthResponse>('/auth/signup', { username, email, password });

export const getProfile = () => api.get<User>('/auth/profile');

export const updateProfile = (data: { username?: string; email?: string; password?: string }) =>
    api.put<User>('/auth/profile', data);

// Playlist APIs
export const getAllPlaylists = () => api.get<Playlist[]>('/playlists');

export const getPlaylist = (id: string) => api.get<Playlist>(`/playlists/${id}`);

export const createPlaylist = (youtubeUrl: string) =>
    api.post<Playlist>('/playlists', { youtubeUrl });

export const deletePlaylist = (id: string) => api.delete(`/playlists/${id}`);

export const updatePlaylist = (id: string, title: string) =>
    api.put<Playlist>(`/playlists/${id}`, { title });

// Video APIs
export const updateVideoStatus = (
    playlistId: string,
    videoId: string,
    isCompleted: boolean,
    notes?: string
) =>
    api.put<Playlist>('/videos/status', {
        playlistId,
        videoId,
        isCompleted,
        notes,
    });

export default api; 