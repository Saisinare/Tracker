const axios = require('axios');

async function getEntirePlaylistVideos(playlist, id, nextPageToken) {


    const url = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=50${(nextPageToken) ? `&pageToken=${nextPageToken}` : ''}&playlistId=${id}&key=${process.env.YOUTUBE_API_KEY}`;
    console.log(id)
    try {
        const response = await axios.get(url);
        const Items = response.data.items;
        const videos = Items.map(video => {
            return {
                title: video.snippet.title, videoId: video.snippet.resourceId.videoId
            }
        })
        playlist.push(...videos)
        if (!response.data.nextPageToken) {
            return;
        }
        await getEntirePlaylistVideos(playlist, id, response.data.nextPageToken)
    } catch (error) {
        console.log("Failed to send the request", error);
        res.status(500).send("Internal Server Error ");
    }
    return playlist;
}

exports.getPlaylistVideos = async (req, res) => {
    const id = req.params.playlistId;
    const playlist = await getEntirePlaylistVideos([], id);
    res.status(200).json({ "videos": playlist });
}

// Function to parse a YouTube video duration in ISO 8601 format (e.g., PT1H30M45S)
function parseDuration(duration) {
    const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

    // Extract hours, minutes, and seconds from the matches or default to 0 if not present
    const hours = matches[1] ? parseInt(matches[1]) : 0;
    const minutes = matches[2] ? parseInt(matches[2]) : 0;
    const seconds = matches[3] ? parseInt(matches[3]) : 0;

    return { hours, minutes, seconds };
}

// Function to get the total duration of a playlist
async function getPlaylistDuration(playlist) {
    const baseURL = 'https://www.googleapis.com/youtube/v3/videos';
    const apiKey = process.env.YOUTUBE_API_KEY;  // Ensure you have your API key set in the environment
    let totalDurationInSeconds = 0;

    // Process playlist in chunks of 50 videos (YouTube API supports up to 50 video IDs per request)
     console.log(playlist)
    for (let i = 0; i < playlist.length; i += 50) {
        const chunk = playlist.slice(i, i + 50);
        const idsString = chunk.map(video => video.videoId).join(',');
        const finalURL = `${baseURL}?part=contentDetails&id=${idsString}&key=${apiKey}`;

        try {
            const response = await axios.get(finalURL);
            const items = response.data.items;

            // For each video in the response, parse the duration and add to the total
            items.forEach(item => {
                const { hours, minutes, seconds } = parseDuration(item.contentDetails.duration);
                totalDurationInSeconds += (hours * 3600) + (minutes * 60) + seconds;
            });
        } catch (error) {
            console.log("Failed to send the request", error);
            return -1; // Return -1 to indicate failure
        }
    }

    // Calculate total hours, minutes, and seconds
    const totalHours = Math.floor(totalDurationInSeconds / 3600);
    const totalMinutes = Math.floor((totalDurationInSeconds % 3600) / 60);
    const totalSeconds = totalDurationInSeconds % 60;

    return { hours: totalHours, minutes: totalMinutes, seconds: totalSeconds };
}

exports.getPlaylistDetails = async(req,res)=>{
    const id = req.params.playlistId;
    const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${id}&key=${process.env.YOUTUBE_API_KEY}`;
    
    
    try{
        const playlist = await getEntirePlaylistVideos([],id)
        const response = await axios.get(url);
        const resPlaylist = {};
        resPlaylist.title= response.data.items[0].snippet.title;
        resPlaylist.description= response.data.items[0].snippet.description;
        resPlaylist.thumbnail= response.data.items[0].snippet.thumbnails.high.url;
        console.log(playlist);
        const playListDuration = await getPlaylistDuration(playlist);
        res.status(200).json({"playListDetail":resPlaylist,"duration":playListDuration});
    }catch(error){
        console.log(error)
        res.status(505).json({"error":"internal server error"});
    }
}