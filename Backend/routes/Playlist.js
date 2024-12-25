const express = require('express');
const { getPlaylistVideos } = require('../controller/Playlist');
const router = express.Router();

router.get('/playlists/:playlistId',getPlaylistVideos)

module.exports = router