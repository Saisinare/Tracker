const User = require('./user')
const Playlist = require('./playlist')

const defineRelationship=()=>{
    User.belongsToMany(Playlist,{through:'UserCollection'})
    Playlist.belongsToMany(User,{through:'UserCollection'})
}

module.exports = defineRelationship;