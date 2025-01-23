const { DataTypes } = require('sequelize');
const {sequelize} = require('../db');
const User = require('./user');
const Playlist = require('./playlist');

const UserCollection = sequelize.define('UserCollection', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, references: { model: User, key: 'id' } },
  playlistId: { type: DataTypes.UUID, allowNull: false, references: { model: Playlist, key: 'id' } },
  videos: { 
    type: DataTypes.JSON, 
    allowNull: false,
    defaultValue: [] 
  }
});

User.belongsToMany(Playlist, { through: UserCollection });
Playlist.belongsToMany(User, { through: UserCollection });

module.exports = UserCollection;
