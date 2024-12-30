const {DataTypes} = require('sequelize');
const {sequelize} = require('../db');

const Playlist = sequelize.define('Playlist',{
    title:{
        type:DataTypes.STRING,
    },
    description:{
        type:DataTypes.STRING
    },
    duration:{
        type:DataTypes.STRING
    },
    playlistId:{
        type:DataTypes.STRING,
        unique:true
    },
    videos:{
        type:DataTypes.JSONB,
    },
    progress:{
        type:DataTypes.FLOAT,
        defaultValue:0
    }
})

module.exports = Playlist;