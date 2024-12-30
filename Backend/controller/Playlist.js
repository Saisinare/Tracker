const axios = require('axios');
const User = require('../models/user'); // Ensure correct import paths
const Playlist = require('../models/playlist'); // Ensure correct import paths

// Helper function to get all videos in a playlist
async function getEntirePlaylistVideos(playlist, id, nextPageToken) {
  const url = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=50${nextPageToken ? `&pageToken=${nextPageToken}` : ''}&playlistId=${id}&key=${process.env.YOUTUBE_API_KEY}`;

  try {
    const response = await axios.get(url);
    const items = response.data.items || [];
    const videos = items.map(video => ({
      title: video.snippet.title,
      videoId: video.snippet.resourceId.videoId
    }));
    playlist.push(...videos);

    if (!response.data.nextPageToken) {
      return playlist;
    }
    return await getEntirePlaylistVideos(playlist, id, response.data.nextPageToken);
  } catch (error) {
    console.error("Failed to send the request", error);
    throw new Error("Error While Fetching Playlist Videos");
  }
}

// API to get all videos in a playlist
exports.getPlaylistVideos = async (req, res) => {
  const id = req.params.playlistId;
  try {
    const playlist = await getEntirePlaylistVideos([], id);
    res.status(200).json({ videos: playlist });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Helper function to parse YouTube duration
function parseDuration(duration) {
  const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = matches[1] ? parseInt(matches[1], 10) : 0;
  const minutes = matches[2] ? parseInt(matches[2], 10) : 0;
  const seconds = matches[3] ? parseInt(matches[3], 10) : 0;
  return { hours, minutes, seconds };
}

// Helper function to get the total duration of a playlist
async function getPlaylistDuration(playlist) {
  const baseURL = 'https://www.googleapis.com/youtube/v3/videos';
  const apiKey = process.env.YOUTUBE_API_KEY;
  let totalDurationInSeconds = 0;

  for (let i = 0; i < playlist.length; i += 50) {
    const chunk = playlist.slice(i, i + 50);
    const idsString = chunk.map(video => video.videoId).join(',');
    const finalURL = `${baseURL}?part=contentDetails&id=${idsString}&key=${apiKey}`;

    try {
      const response = await axios.get(finalURL);
      const items = response.data.items;
      items.forEach(item => {
        const { hours, minutes, seconds } = parseDuration(item.contentDetails.duration);
        totalDurationInSeconds += (hours * 3600) + (minutes * 60) + seconds;
      });
    } catch (error) {
      console.error("Failed to send the request", error);
      return -1;
    }
  }

  const totalHours = Math.floor(totalDurationInSeconds / 3600);
  const totalMinutes = Math.floor((totalDurationInSeconds % 3600) / 60);
  const totalSeconds = totalDurationInSeconds % 60;
  return { hours: totalHours, minutes: totalMinutes, seconds: totalSeconds };
}

// API to get playlist details
exports.getPlaylistDetails = async (req, res) => {
  const id = req.params.playlistId;
  const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${id}&key=${process.env.YOUTUBE_API_KEY}`;

  try {
    const playlist = await getEntirePlaylistVideos([], id);
    const playListDuration = await getPlaylistDuration(playlist);
    const response = await axios.get(url);
    const resPlaylist = {
      title: response.data.items[0].snippet.title,
      description: response.data.items[0].snippet.description,
      thumbnail: response.data.items[0].snippet.thumbnails.high.url,
    };
    res.status(200).json({ playListDetail: resPlaylist, duration: playListDuration });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// API to add playlist to user's collection
exports.addPlaylistToCollection = async (req, res) => {
  const userId = req.user.id; // Ensure userId is obtained correctly
  const playlistId = req.body.playlistId;

  try {
    const user = await User.findOne({ where: { id: userId } });
    const playlist = await Playlist.findByPk(playlistId); // Fetch existing playlist by ID

    if (!user || !playlist) {
      return res.status(404).json({ pass: false, message: "User or Playlist not found" });
    }

    await user.addPlaylist(playlist); // Use Sequelize's method to add playlist to user
    res.status(200).json({ pass: true, message: "Playlist added to user's collection successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ pass: false, message: "Internal Server Error" });
  }
}
