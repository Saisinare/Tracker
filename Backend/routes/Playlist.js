const express = require('express');
const { getPlaylistVideos, getPlaylistDetails } = require('../controller/Playlist');
const router = express.Router();

router.get('/playlists/:playlistId',getPlaylistDetails)
router.get('/playlists/:playlistId/videos',getPlaylistVideos)

module.exports = router