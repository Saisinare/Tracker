const {DataTypes} = require('sequelize');
const {sequelize} = require('../db');
const User = sequelize.define('User',{
    name:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    hashedPassword:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    createdAt:{
        type:DataTypes.DATE,
        defaultValue:DataTypes.NOW
    }
});

module.exports = User;