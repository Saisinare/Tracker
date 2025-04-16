const Video = require('../models/Video');
const Playlist = require('../models/Playlist');

// Get all videos for a playlist
exports.getVideosByPlaylist = async (req, res) => {
    try {
        const videos = await Video.find({ playlist: req.params.playlistId })
            .sort({ order: 1 });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new video
exports.createVideo = async (req, res) => {
    try {
        const { title, youtubeId, playlistId, order } = req.body;
        
        // Verify playlist exists
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        const video = new Video({
            title,
            youtubeId,
            playlist: playlistId,
            order
        });

        const savedVideo = await video.save();
        
        // Add video to playlist
        playlist.videos.push(savedVideo._id);
        await playlist.save();

        res.status(201).json(savedVideo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update video status or notes
exports.updateVideo = async (req, res) => {
    try {
        const { isCompleted, notes } = req.body;
        const video = await Video.findByIdAndUpdate(
            req.params.id,
            { isCompleted, notes },
            { new: true }
        );
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }
        res.json(video);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a video
exports.deleteVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Remove video from playlist
        await Playlist.findByIdAndUpdate(
            video.playlist,
            { $pull: { videos: video._id } }
        );

        await video.remove();
        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update video order
exports.updateVideoOrder = async (req, res) => {
    try {
        const { videos } = req.body; // Array of { id, order }
        
        const updateOperations = videos.map(video => ({
            updateOne: {
                filter: { _id: video.id },
                update: { order: video.order }
            }
        }));

        await Video.bulkWrite(updateOperations);
        res.json({ message: 'Video order updated successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}; 