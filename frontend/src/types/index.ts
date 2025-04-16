export interface User {
    id: string;
    username: string;
    email: string;
}

export interface Video {
    videoId: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    position: number;
    duration: string;
    durationSeconds: number;
    isCompleted: boolean;
    notes: string;
}

export interface Playlist {
    _id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    youtubePlaylistId: string;
    totalDurationSeconds: number;
    videos: Video[];
    completionPercentage: number;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: User;
}

export interface ApiError {
    message: string;
} 