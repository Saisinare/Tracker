const axios = require('axios');

async function getEntirePlaylistVideos(playlist, id, nextPageToken) {


    const url = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=50${(nextPageToken) ? `&pageToken=${nextPageToken}` : ''}&playlistId=${id}&key=${process.env.YOUTUBE_API_KEY}`;

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