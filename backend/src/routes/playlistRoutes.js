const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');

// Get all playlists
router.get('/', playlistController.getAllPlaylists);

// Create a new playlist
router.post('/', playlistController.createPlaylist);

// Get a single playlist
router.get('/:id', playlistController.getPlaylist);

// Update a playlist
router.put('/:id', playlistController.updatePlaylist);

// Delete a playlist
router.delete('/:id', playlistController.deletePlaylist);

// Get playlist progress
router.get('/:id/progress', playlistController.getPlaylistProgress);

module.exports = router; 