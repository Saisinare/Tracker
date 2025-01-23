const express = require('express');
const { getPlaylistVideos, getPlaylistDetails, addPlaylistToCollection, removePlaylistFromCollection, getCollection, getCollectionPlaylist } = require('../controller/Playlist');
const { verifyToken } = require('../middleware/verify');
const router = express.Router();

router.get('/playlists/:playlistId',getPlaylistDetails)
router.get('/playlists/:playlistId/videos',getPlaylistVideos)
router.get('/collection',verifyToken,getCollection)
router.get('/collection/playlists/:playlistId',verifyToken,getCollectionPlaylist);
router.post('/collection/playlist',verifyToken,addPlaylistToCollection)
router.delete('/collection/playlists/:playlistId',verifyToken,removePlaylistFromCollection)
module.exports = router