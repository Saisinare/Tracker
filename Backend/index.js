const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/Auth');
const playlistRouter = require('./routes/Playlist');
const app = express();
const cors = require('cors');

app.use(cors());
dotenv.config();
app.use(authRoutes);
app.use(express.json());
app.use(playlistRouter);

app.listen(process.env.PORT,()=>{
    console.log("server has started and its running on: "+process.env.SERVER_PROTOCOL+process.env.SERVER_HOSTNAME+process.env.PORT)
})