const axios = require('axios');
const User = require('../models/user');
const Playlist = require('../models/playlist');
const UserCollection = require('../models/userCollection');

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
      items.forEach((item, index) => {
        const { hours, minutes, seconds } = parseDuration(item.contentDetails.duration);
        const time = { "hours": hours, "minutes": minutes, "seconds": seconds };
        playlist[index + i].time = time;
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
  return { "videos": playlist, hours: totalHours, minutes: totalMinutes, seconds: totalSeconds };
}

async function getPlaylistInfo(playlistId) {
  const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${process.env.YOUTUBE_API_KEY}`;

  try {
    const response = await axios.get(url);
    const resPlaylist = {
      title: response.data.items[0].snippet.title,
      description: response.data.items[0].snippet.description,
      thumbnail: response.data.items[0].snippet.thumbnails.high.url,
    };
    return resPlaylist;
  } catch (error) {
    throw new Error("Error while fetching the playlist Info");
  }
}

// API to get playlist details
exports.getPlaylistDetails = async (req, res) => {
  const id = req.params.playlistId;

  try {
    const playlist = await getEntirePlaylistVideos([], id);
    const playListDuration = await getPlaylistDuration(playlist);
    console.log(playListDuration)
    const resPlaylist = await getPlaylistInfo(id);
    console.log(resPlaylist)
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
    const playlist = await Playlist.findOne({ where: { playlistId } }); // Fetch existing playlist by ID
    if (user) {
      if (!playlist) {
        const videos = await getEntirePlaylistVideos([], playlistId);  //return array of videos 
        const playlistInfo = await getPlaylistInfo(playlistId);             //{ title thumbnail description }
        const playlistDurationInfo = await getPlaylistDuration(videos)      //{videos[{title,description,time{}}],hours,minutes,seconds}

        const newPlaylist = new Playlist({ playlistId: playlistId, title: playlistInfo.title, description: playlistInfo.description, duration: { hour: playlistDurationInfo.hours, minutes: playlistDurationInfo.minutes, seconds: playlistDurationInfo.seconds }, thumbnail: playlistInfo.thumbnail, videos: playlistDurationInfo.videos })

        await newPlaylist.save();

        await user.addPlaylist(newPlaylist);
        res.status(200).json({ pass: true, message: "Playlist added to user's collection successfully" });
      }
      if (playlist) {
        await user.addPlaylist(playlist);
        res.status(200).json({ pass: true, message: "Playlist added to user's collection successfully" })
      }
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ pass: false, message: "Internal Server Error" });
  }
}
//APIs remove playlsit from user collection 
exports.removePlaylistFromCollection = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming authentication middleware attaches user
    const { playlistId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const playlist = await Playlist.findOne({ where: { playlistId } });
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Unlink the playlist from the user
    await user.removePlaylist(playlist);

    return res.json({ message: "Playlist unlinked successfully" });
  } catch (error) {
    console.error("Error unlinking playlist:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
//API for getting collection of user
exports.getCollection = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findByPk(userId, {
      include: {
        model: Playlist,
        through: { attributes: [] },
        attributes: { exclude: ['videos'] }
      }
    })
    if (!user) {
      return res.json({ pass: false, message: "User not Found" })
    }
    return res.json({ pass: true, "Collection": user.Playlists })
  } catch (error) {
    console.log(error);
    res.json({ pass: false, "message": "Internal Server Error" });
  }
}

//API to get the playlist from the Collection 
exports.getCollectionPlaylist = async (req, res) => {
  const userId = req.user.id;
  const playlistId = req.params.playlistId;
  try{
    const user = await User.findByPk(userId,{
      include:{
        model:UserCollection,
        through:{attributes:[]},

      }
    })
    if(!user){
      return res.status(404).json({pass:false,message:"Playlist Not Exist in Your Collection "})
    }
    return res.status(200).json({pass:true,playlist:user.Playlists})
  }catch(error){
    console.log(error);
    return res.status(500).json({pass:false,message:"Internal Server Error"})
  }
}

//Controller for updating the progress 