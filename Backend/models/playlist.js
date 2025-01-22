const {DataTypes, JSONB} = require('sequelize');
const {sequelize} = require('../db');

const Playlist = sequelize.define('Playlist',{
    title:{
        type:DataTypes.TEXT,
    },
    description:{
        type:DataTypes.TEXT,
    },
    thumbnail:{
        type:DataTypes.STRING,
    },
    duration:{
        type:JSONB,
    },
    playlistId:{
        type:DataTypes.STRING,
        unique:true
    },
    videos:{
        type:DataTypes.ARRAY(DataTypes.JSONB),
    },
    progress:{
        type:DataTypes.FLOAT,
        defaultValue:0
    }
})

module.exports = Playlist;