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
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
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

// Index for faster lookups by YouTube ID and user
playlistSchema.index({ youtubePlaylistId: 1 });
playlistSchema.index({ user: 1 });

const Playlist = mongoose.model('Playlist', playlistSchema);
module.exports = Playlist; 