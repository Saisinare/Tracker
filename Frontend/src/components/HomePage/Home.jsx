import { Button, Input } from '@material-tailwind/react'
import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Home() {
    const [playlistURL, setPlaylistURL] = useState(" ");
    const [playlistInfo, setPlaylistInfo] = useState({})
    const [showData, setshowData] = useState(false)
    useEffect(() => {
        if (playlistInfo.playListDetail) {
            setshowData(true);
        }

    }, [playlistInfo])

    const handlClick = async () => {
        const URLObject = new URL(playlistURL);
        const params = new URLSearchParams(URLObject.search);
        const playListId = params.get('list');

        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/playlists/${playListId}`);
        setPlaylistInfo(response.data);
        console.log(playlistInfo);
    }
    const changePlaylistState = (item) => {
        setPlaylistURL(item.target.value);
    }
    const backgroundURL = `${import.meta.env.VITE_BACKEND_URL}/laptop.png`;
    return (
        <div>
            <div className=' flex w-screen h-screen  items-center mt-24 gap-3 flex-col '>
                <div className='flex w-full h-12 justify-center gap-2'>
                    <input type='text' value={playlistURL} className='h-full w-2/3 rounded-none px-2  shadow border-2 border-black text-sm font-medium text-blue-gray-900' onChange={changePlaylistState} />
                    <Button onClick={handlClick} className=' h-full w-1/12 rounded-none -z-10'> Search </Button>
                </div>
                {

                    showData ? <div className=' h-fit w-3/4 bg-white flex flex-col shadow border-2 border-black '>
                        <div className='w-full flex gap-1 p-5 border-black'>
                            <div>
                                <img src={playlistInfo.playListDetail.thumbnail} className=' h-48' />
                            </div>
                            <div className=' flex flex-col h-full w-3/4 items-stretch px-10 gap-3'>
                                <div className=' font-bold text-2xl'>
                                    {playlistInfo.playListDetail.title}
                                </div>
                                <div className=' h-2/3 text-sm'>
                                    {playlistInfo.playListDetail.description}
                                </div>
                            </div>
                        </div>
                        <div className=' flex  w-full h-auto p-2 bg-white shadow justify-between pl-5
                        '>
                            <div className=' text-sm'>                                    {playlistInfo.duration.hours + " Hours " + playlistInfo.duration.minutes + " Minutes " + playlistInfo.duration.seconds + " Seconds "}</div>
                            <Button className=' rounded-none '>Add to my collections</Button>
                        </div>
                    </div> : ""
                }
            </div>

        </div>
    )
}


