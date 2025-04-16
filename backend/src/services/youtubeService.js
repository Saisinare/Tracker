const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

if (!YOUTUBE_API_KEY) {
    console.error('Error: YouTube API key not found. Please set YOUTUBE_API_KEY in your .env file.');
    // Optionally exit or throw an error depending on desired behavior
    // process.exit(1);
}

const youtube = google.youtube({
    version: 'v3',
    auth: YOUTUBE_API_KEY
});

// Helper Function: Extract Playlist ID from URL
const extractPlaylistIdFromUrl = (url) => {
    try {
        const parsedUrl = new URL(url);
        const playlistId = parsedUrl.searchParams.get('list');
        if (!playlistId) {
            throw new Error('Playlist ID not found in URL parameters.');
        }
        return playlistId;
    } catch (error) {
        console.error("Error parsing YouTube URL:", error.message);
        // Fallback regex for cases where URL() might fail or ID isn't in query param
        const regex = /[?&]list=([^&]+)/;
        const match = url.match(regex);
        if (match && match[1]) {
            return match[1];
        }
        throw new Error('Could not extract Playlist ID from URL.');
    }
};

// Helper Function: Parse YouTube ISO 8601 Duration to Seconds
const parseDurationToSeconds = (duration) => {
    if (!duration) return 0;
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || 0, 10);
    const minutes = parseInt(match[2] || 0, 10);
    const seconds = parseInt(match[3] || 0, 10);

    return hours * 3600 + minutes * 60 + seconds;
};

// Fetch basic details for a playlist
const getPlaylistDetails = async (playlistId) => {
    try {
        const response = await youtube.playlists.list({
            part: 'snippet', // Includes title, description, thumbnails, channelTitle
            id: playlistId,
            maxResults: 1
        });

        if (!response.data.items || response.data.items.length === 0) {
            throw new Error(`Playlist with ID ${playlistId} not found.`);
        }
        return response.data.items[0].snippet;
    } catch (error) {
        console.error(`Error fetching playlist details for ${playlistId}:`, error.message);
        throw error; // Re-throw to be handled by the controller
    }
};

// Fetch all video IDs and positions within a playlist (handles pagination)
const getAllPlaylistItems = async (playlistId) => {
    let allItems = [];
    let nextPageToken = null;

    try {
        do {
            const response = await youtube.playlistItems.list({
                part: 'snippet,contentDetails', // Need contentDetails.videoId and snippet.position
                playlistId: playlistId,
                maxResults: 50, // Max allowed by API
                pageToken: nextPageToken
            });

            if (response.data.items) {
                allItems = allItems.concat(response.data.items);
            }
            nextPageToken = response.data.nextPageToken;
        } while (nextPageToken);

        return allItems;
    } catch (error) {
        console.error(`Error fetching playlist items for ${playlistId}:`, error.message);
        throw error;
    }
};

// Fetch details for multiple videos (handles chunking for API limit)
const getVideoDetails = async (videoIds) => {
    let allVideoDetails = [];
    const chunkSize = 50; // YouTube API limit for video IDs per request

    try {
        for (let i = 0; i < videoIds.length; i += chunkSize) {
            const chunk = videoIds.slice(i, i + chunkSize);
            const response = await youtube.videos.list({
                part: 'snippet,contentDetails', // Need snippet (title, desc, thumbs), contentDetails (duration)
                id: chunk.join(','), // Comma-separated IDs
            });

            if (response.data.items) {
                allVideoDetails = allVideoDetails.concat(response.data.items);
            }
        }
        return allVideoDetails;
    } catch (error) {
        console.error(`Error fetching video details:`, error.message);
        throw error;
    }
};

// Fetch fresh playlist information
const getFreshPlaylistInfo = async (playlistId) => {
    try {
        // Get playlist details
        const playlistResponse = await youtube.playlists.list({
            part: 'snippet,contentDetails',
            id: playlistId,
            maxResults: 1
        });

        if (!playlistResponse.data.items || playlistResponse.data.items.length === 0) {
            throw new Error(`Playlist with ID ${playlistId} not found.`);
        }

        const playlistInfo = playlistResponse.data.items[0];

        // Get all videos in the playlist
        let allVideos = [];
        let nextPageToken = null;

        do {
            const videosResponse = await youtube.playlistItems.list({
                part: 'snippet,contentDetails',
                playlistId: playlistId,
                maxResults: 50,
                pageToken: nextPageToken
            });

            if (videosResponse.data.items) {
                // Extract video IDs to fetch detailed information
                const videoIds = videosResponse.data.items.map(item => item.contentDetails.videoId);
                
                // Fetch detailed video information including duration
                const videoDetailsResponse = await youtube.videos.list({
                    part: 'snippet,contentDetails,statistics',
                    id: videoIds.join(',')
                });

                // Combine playlist item information with video details
                const processedVideos = videosResponse.data.items.map(item => {
                    const videoDetail = videoDetailsResponse.data.items.find(
                        v => v.id === item.contentDetails.videoId
                    );
                    
                    if (!videoDetail) return null;

                    return {
                        videoId: item.contentDetails.videoId,
                        title: item.snippet.title,
                        description: item.snippet.description,
                        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
                        position: item.snippet.position,
                        duration: videoDetail.contentDetails.duration,
                        durationSeconds: parseDurationToSeconds(videoDetail.contentDetails.duration),
                        viewCount: videoDetail.statistics.viewCount,
                        publishedAt: item.snippet.publishedAt
                    };
                }).filter(Boolean); // Remove any null entries

                allVideos = [...allVideos, ...processedVideos];
            }

            nextPageToken = videosResponse.data.nextPageToken;
        } while (nextPageToken);

        // Calculate total duration
        const totalDurationSeconds = allVideos.reduce((total, video) => total + video.durationSeconds, 0);

        return {
            playlistInfo: {
                id: playlistInfo.id,
                title: playlistInfo.snippet.title,
                description: playlistInfo.snippet.description,
                thumbnailUrl: playlistInfo.snippet.thumbnails.high?.url || playlistInfo.snippet.thumbnails.default?.url,
                totalVideos: playlistInfo.contentDetails.itemCount,
                publishedAt: playlistInfo.snippet.publishedAt,
                totalDurationSeconds
            },
            videos: allVideos
        };
    } catch (error) {
        console.error('Error fetching fresh playlist info:', error);
        throw error;
    }
};

module.exports = {
    extractPlaylistIdFromUrl,
    parseDurationToSeconds,
    getPlaylistDetails,
    getAllPlaylistItems,
    getVideoDetails,
    getFreshPlaylistInfo
}; 