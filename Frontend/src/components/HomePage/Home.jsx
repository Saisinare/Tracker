import { Button, Input } from '@material-tailwind/react'
import React, { useState } from 'react'
import axios from 'axios'

export default function Home() {
    const [playlistURL, setPlaylistURL] = useState(" ");
    const [videos, setVideos] = useState([]);
    const handlClick = async()=>{
        const URLObject = new URL(playlistURL);
        const params = new URLSearchParams(URLObject.search);
        const playListId = params.get('list');
        
        const playlist = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/playlists/${playListId}`);
        
        setVideos(playlist);
        console.log(playlist);
    }
    const changePlaylistState=(item)=>{
        console.log(item.target.value);
        setPlaylistURL(item.target.value);
    }    
    return (
        <div>
            <div className=' flex w-screen h-screen justify-center items-center gap-1'>
                <input type='text' value={playlistURL} className=' w-2/3 h-14  rounded-md border border-gray-800 p-5 text-sm' onChange={changePlaylistState} />
                <Button onClick={handlClick} className=' h-14 w-1/12'> Search </Button>
            </div>

        </div>
    )
}
