const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const playlistController = require('../controllers/playlistController');

// Update video status (completion and notes)
router.put('/status', playlistController.updateVideoStatus);

// Get all videos for a playlist
router.get('/playlist/:playlistId', videoController.getVideosByPlaylist);

// Create a new video
router.post('/', videoController.createVideo);

// Update video status or notes
router.put('/:id', videoController.updateVideo);

// Delete a video
router.delete('/:id', videoController.deleteVideo);

// Update video order
router.put('/order/update', videoController.updateVideoOrder);

module.exports = router; 