const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config()
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres'
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database Connected Sucessfully...")
    } catch (error) {
        console.log("Unable to connect the database : " + error)
    }
};

const syncModel = async()=>{
    await sequelize.sync();
    console.log("Models are synchronized sucessfully..");
}

module.exports = {sequelize,connectDB,syncModel};