const Playlist = require('../models/Playlist');
const Video = require('../models/Video');
const youtubeService = require('../services/youtubeService');

// Helper to get the best available thumbnail URL
const getBestThumbnail = (thumbnails) => {
    if (!thumbnails) return null;
    return thumbnails.maxres?.url || thumbnails.high?.url || thumbnails.medium?.url || thumbnails.standard?.url || thumbnails.default?.url;
};

// Get all playlists with fresh YouTube data
exports.getAllPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.find().sort({ createdAt: -1 });
        
        // Fetch fresh information for each playlist
        const playlistsWithDetails = await Promise.all(playlists.map(async (playlist) => {
            try {
                const freshInfo = await youtubeService.getFreshPlaylistInfo(playlist.youtubePlaylistId);
                
                // Get completion status for videos from database
                const videoStatuses = await Video.find(
                    { playlist: playlist._id },
                    { youtubeVideoId: 1, isCompleted: 1, notes: 1 }
                );
                
                // Create a map of video statuses
                const statusMap = new Map(
                    videoStatuses.map(v => [v.youtubeVideoId, { 
                        isCompleted: v.isCompleted,
                        notes: v.notes 
                    }])
                );

                // Combine fresh video info with stored completion status
                const videosWithStatus = freshInfo.videos.map(video => ({
                    ...video,
                    isCompleted: statusMap.get(video.videoId)?.isCompleted || false,
                    notes: statusMap.get(video.videoId)?.notes || ''
                }));

                // Calculate completion percentage
                const totalVideos = videosWithStatus.length;
                const completedVideos = videosWithStatus.filter(v => v.isCompleted).length;
                const progress = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

                return {
                    _id: playlist._id,
                    ...freshInfo.playlistInfo,
                    videos: videosWithStatus,
                    completionPercentage: progress,
                    createdAt: playlist.createdAt,
                    updatedAt: playlist.updatedAt
                };
            } catch (error) {
                console.error(`Error fetching fresh info for playlist ${playlist.youtubePlaylistId}:`, error);
                // Return basic playlist info if YouTube fetch fails
                return {
                    _id: playlist._id,
                    title: playlist.title,
                    youtubePlaylistId: playlist.youtubePlaylistId,
                    error: 'Failed to fetch fresh YouTube data'
                };
            }
        }));

        res.json(playlistsWithDetails);
    } catch (error) {
        console.error("Error in getAllPlaylists:", error);
        res.status(500).json({ message: error.message });
    }
};

// Create a new playlist by fetching data from YouTube
exports.createPlaylist = async (req, res) => {
    const { youtubeUrl } = req.body;

    if (!youtubeUrl) {
        return res.status(400).json({ message: 'YouTube Playlist URL is required' });
    }

    try {
        // 1. Extract Playlist ID
        const youtubePlaylistId = youtubeService.extractPlaylistIdFromUrl(youtubeUrl);

        // 2. Check if playlist already exists in DB
        const existingPlaylist = await Playlist.findOne({ youtubePlaylistId });
        if (existingPlaylist) {
            return res.status(409).json({ message: 'Playlist already exists in the tracker.', playlistId: existingPlaylist._id });
        }

        // 3. Fetch Playlist Details from YouTube API
        const playlistDetails = await youtubeService.getPlaylistDetails(youtubePlaylistId);

        // 4. Fetch Playlist Items (Video IDs and positions) from YouTube API
        const playlistItems = await youtubeService.getAllPlaylistItems(youtubePlaylistId);

        if (!playlistItems || playlistItems.length === 0) {
            return res.status(404).json({ message: 'Could not find any videos in the playlist.' });
        }

        // 5. Extract Video IDs
        const videoIds = playlistItems.map(item => item.contentDetails?.videoId).filter(id => id);
        if (videoIds.length === 0) {
            return res.status(404).json({ message: 'No valid video IDs found in the playlist items.' });
        }

        // 6. Fetch Video Details (including durations) from YouTube API
        const videoDetailsList = await youtubeService.getVideoDetails(videoIds);
        const videoDetailsMap = new Map(videoDetailsList.map(video => [video.id, video]));

        // 7. Create the Playlist Document (without videos initially)
        const newPlaylist = new Playlist({
            title: playlistDetails.title || 'Untitled Playlist',
            youtubePlaylistId: youtubePlaylistId,
            description: playlistDetails.description,
            thumbnailUrl: getBestThumbnail(playlistDetails.thumbnails),
            sourceUrl: youtubeUrl,
            totalDurationSeconds: 0, // Will be calculated next
            videos: [] // Will be populated with saved video IDs
        });

        // 8. Create Video Documents and Calculate Total Duration
        let totalDuration = 0;
        const videoDocsToSave = [];
        const savedVideoIds = [];

        for (const item of playlistItems) {
            const videoId = item.contentDetails?.videoId;
            const position = item.snippet?.position;
            const videoDetail = videoDetailsMap.get(videoId);

            if (!videoId || typeof position === 'undefined' || !videoDetail) {
                console.warn(`Skipping playlist item due to missing data: ${JSON.stringify(item.snippet?.title)}`);
                continue; // Skip if essential data is missing
            }

            const durationSeconds = youtubeService.parseDurationToSeconds(videoDetail.contentDetails?.duration);
            totalDuration += durationSeconds;

            videoDocsToSave.push({
                title: videoDetail.snippet?.title || 'Untitled Video',
                youtubeVideoId: videoId,
                playlist: newPlaylist._id, // Link to the parent playlist
                description: videoDetail.snippet?.description,
                thumbnailUrl: getBestThumbnail(videoDetail.snippet?.thumbnails),
                durationSeconds: durationSeconds,
                order: position,
                isCompleted: false, // Default status
                notes: '' // Default notes
            });
        }

        // 9. Bulk insert videos for efficiency
        if (videoDocsToSave.length > 0) {
             const savedVideos = await Video.insertMany(videoDocsToSave);
             savedVideoIds.push(...savedVideos.map(v => v._id));
        }

        // 10. Update Playlist with total duration and video IDs
        newPlaylist.totalDurationSeconds = totalDuration;
        newPlaylist.videos = savedVideoIds;
        const savedPlaylist = await newPlaylist.save();

        res.status(201).json(savedPlaylist);

    } catch (error) {
        console.error("Error in createPlaylist:", error);
        // Handle specific errors (e.g., API errors, validation errors)
        if (error.message.includes('Could not extract Playlist ID')) {
            return res.status(400).json({ message: 'Invalid YouTube Playlist URL format.' });
        }
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        if (error.response && error.response.data && error.response.data.error) {
             // Handle Google API specific errors
             console.error("Google API Error:", error.response.data.error);
             return res.status(error.response.data.error.code || 500).json({ 
                 message: `YouTube API Error: ${error.response.data.error.message}` 
             });
        }
        res.status(500).json({ message: 'Failed to create playlist.', error: error.message });
    }
};

// Get a single playlist with fresh YouTube data
exports.getPlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        try {
            // Fetch fresh information from YouTube
            const freshInfo = await youtubeService.getFreshPlaylistInfo(playlist.youtubePlaylistId);
            
            // Get completion status for videos from database
            const videoStatuses = await Video.find(
                { playlist: playlist._id },
                { youtubeVideoId: 1, isCompleted: 1, notes: 1 }
            );
            
            // Create a map of video statuses
            const statusMap = new Map(
                videoStatuses.map(v => [v.youtubeVideoId, { 
                    isCompleted: v.isCompleted,
                    notes: v.notes 
                }])
            );

            // Combine fresh video info with stored completion status
            const videosWithStatus = freshInfo.videos.map(video => ({
                ...video,
                isCompleted: statusMap.get(video.videoId)?.isCompleted || false,
                notes: statusMap.get(video.videoId)?.notes || ''
            }));

            // Calculate completion percentage
            const totalVideos = videosWithStatus.length;
            const completedVideos = videosWithStatus.filter(v => v.isCompleted).length;
            const progress = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

            const response = {
                _id: playlist._id,
                ...freshInfo.playlistInfo,
                videos: videosWithStatus,
                completionPercentage: progress,
                createdAt: playlist.createdAt,
                updatedAt: playlist.updatedAt
            };

            res.json(response);
        } catch (youtubeError) {
            console.error('Error fetching fresh YouTube data:', youtubeError);
            // Fallback to database information if YouTube fetch fails
            res.status(500).json({ 
                message: 'Failed to fetch fresh YouTube data',
                playlist: playlist 
            });
        }
    } catch (error) {
        console.error("Error in getPlaylist:", error);
        res.status(500).json({ message: error.message });
    }
};

// Update a playlist (Note: Should generally not update YT data, maybe only local title?)
exports.updatePlaylist = async (req, res) => {
    try {
        // Only allow updating non-YouTube sourced fields like a custom title or description?
        // For now, let's just allow updating the title.
        const { title } = req.body;
        const updateData = {};
        if (title) updateData.title = title;
        // Add other updatable fields here if needed

        const playlist = await Playlist.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true } // Return the updated document
        ) // No need to populate here unless returning the full updated playlist with videos
        
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }
        // Return only the updated playlist basic info or the full object if needed
        // For simplicity, return the updated playlist document without populated videos
        res.json(playlist);
    } catch (error) {
        console.error("Error in updatePlaylist:", error);
        res.status(400).json({ message: error.message });
    }
};

// Delete a playlist and its associated videos
exports.deletePlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        // Delete all associated videos using the playlist reference
        await Video.deleteMany({ playlist: playlist._id });

        // Delete the playlist itself
        // Mongoose 6+ uses deleteOne() on the model or remove() on the instance.
        // findByIdAndDelete is often simpler.
        await Playlist.findByIdAndDelete(req.params.id);

        res.json({ message: 'Playlist and associated videos deleted successfully' });
    } catch (error) {
        console.error("Error in deletePlaylist:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get playlist progress (Calculated dynamically or fetched if stored)
// This endpoint might be redundant if progress is calculated in getAllPlaylists/getPlaylist
exports.getPlaylistProgress = async (req, res) => {
    try {
        // This could be simplified if the frontend relies on the progress from getPlaylist/getAllPlaylists
        const videoStatuses = await Video.find({ playlist: req.params.id }).select('isCompleted');
        
        if (!videoStatuses || videoStatuses.length === 0) {
             // Check if the playlist itself exists even if it has no videos yet
             const playlistExists = await Playlist.findById(req.params.id).select('_id');
             if (!playlistExists) {
                 return res.status(404).json({ message: 'Playlist not found' });
             }
             // Playlist exists but has no videos
             return res.json({ playlistId: req.params.id, totalVideos: 0, completedVideos: 0, progress: 0 });
        }

        const totalVideos = videoStatuses.length;
        const completedVideos = videoStatuses.filter(video => video.isCompleted).length;
        const progress = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

        res.json({
            playlistId: req.params.id,
            totalVideos,
            completedVideos,
            progress
        });
    } catch (error) {
        console.error("Error in getPlaylistProgress:", error);
        res.status(500).json({ message: error.message });
    }
};

// Update video status
exports.updateVideoStatus = async (req, res) => {
    try {
        const { playlistId, videoId, isCompleted, notes } = req.body;

        let video = await Video.findOne({ 
            playlist: playlistId,
            youtubeVideoId: videoId
        });

        if (!video) {
            // Create new video entry if it doesn't exist
            video = new Video({
                playlist: playlistId,
                youtubeVideoId: videoId,
                isCompleted,
                notes
            });
        } else {
            // Update existing video
            video.isCompleted = isCompleted;
            if (notes !== undefined) {
                video.notes = notes;
            }
        }

        await video.save();

        // Return updated playlist with fresh YouTube data
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        const freshInfo = await youtubeService.getFreshPlaylistInfo(playlist.youtubePlaylistId);
        
        // Get all video statuses
        const videoStatuses = await Video.find(
            { playlist: playlistId },
            { youtubeVideoId: 1, isCompleted: 1, notes: 1 }
        );
        
        const statusMap = new Map(
            videoStatuses.map(v => [v.youtubeVideoId, { 
                isCompleted: v.isCompleted,
                notes: v.notes 
            }])
        );

        const videosWithStatus = freshInfo.videos.map(video => ({
            ...video,
            isCompleted: statusMap.get(video.videoId)?.isCompleted || false,
            notes: statusMap.get(video.videoId)?.notes || ''
        }));

        const totalVideos = videosWithStatus.length;
        const completedVideos = videosWithStatus.filter(v => v.isCompleted).length;
        const progress = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

        const response = {
            _id: playlist._id,
            ...freshInfo.playlistInfo,
            videos: videosWithStatus,
            completionPercentage: progress,
            createdAt: playlist.createdAt,
            updatedAt: playlist.updatedAt
        };

        res.json(response);
    } catch (error) {
        console.error("Error in updateVideoStatus:", error);
        res.status(500).json({ message: error.message });
    }
}; 