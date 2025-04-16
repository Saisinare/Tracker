const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    youtubePlaylistId: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    thumbnailUrl: String,
    totalDurationSeconds: {
        type: Number,
        default: 0
    },
    videos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    }],
    sourceUrl: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
playlistSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for faster lookups by YouTube ID
playlistSchema.index({ youtubePlaylistId: 1 });

module.exports = mongoose.model('Playlist', playlistSchema); 