const express = require('express');
const { getPlaylistVideos, getPlaylistDetails, addPlaylistToCollection } = require('../controller/Playlist');
const { verifyToken } = require('../middleware/verify');
const router = express.Router();

router.get('/playlists/:playlistId',getPlaylistDetails)
router.get('/playlists/:playlistId/videos',getPlaylistVideos)
router.post('/collection/playlist',verifyToken,addPlaylistToCollection)
module.exports = router