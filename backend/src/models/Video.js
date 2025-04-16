const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    youtubeVideoId: {
        type: String,
        required: true,
        unique: true
    },
    playlist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Playlist',
        required: true
    },
    description: String,
    thumbnailUrl: String,
    durationSeconds: {
        type: Number,
        required: true,
        default: 0
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    notes: {
        type: String,
        default: ''
    },
    order: {
        type: Number,
        required: true
    },
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
videoSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for faster lookups
videoSchema.index({ playlist: 1, order: 1 });
videoSchema.index({ youtubeVideoId: 1 });

module.exports = mongoose.model('Video', videoSchema); 