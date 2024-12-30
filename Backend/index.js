const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/Auth');
const playlistRouter = require('./routes/Playlist');
const app = express();
const cors = require('cors');
const {connectDB,syncModel} = require('./db')
const cookieParser = require('cookie-parser');
const defineRelationship = require('./models/relationship')
app.use(express.static('public'));
app.use(cors());
app.use(cookieParser());

dotenv.config();
connectDB();
defineRelationship();
syncModel();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(authRoutes);
app.use(playlistRouter);

app.listen(process.env.PORT,()=>{
    console.log("server has started and its running on: "+process.env.SERVER_PROTOCOL+process.env.SERVER_HOSTNAME+process.env.PORT)
})