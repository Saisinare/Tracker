const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {

    const { name, email, password } = req.body;

    try {
        const emailIdExist = await User.findOne({ where: { email } })
        if (emailIdExist) {
            return res.status(409).json({ "message": "Incorrect Credentials", "pass": false });
        }
        const passwordHashed = await bcrypt.hash(password, 10);
        const user = new User({ name: name, email: email, hashedPassword: passwordHashed });
        await user.save();
        const token = jwt.sign({ id: user.id, name: name }, process.env.JWT_SECRET_KEY, { expiresIn: "28d" })
        res.setHeader("Authorization", `Bearer ${token}`);
        res.status(200).json({ "Message": "User Register Sucessfully..!", "pass": true });
    } catch (error) {
        console.log("Error creating a new user: " + error);
        res.status(500).json({ "error": "Internal Server Error", "pass": false });
    }
}

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ "pass": false, "message": "Invalide credentials" });
        }
        const isMatch = await bcrypt.compare(password, user.dataValues.hashedPassword)
        if (isMatch) {
            const token = jwt.sign({ id: user.dataValues.id, name: user.dataValues.name }, process.env.JWT_SECRET_KEY, { expiresIn: "28d" })
            res.setHeader("Authorization", `Bearer ${token}`);
            return res.status(200).json({ "pass": true, "message": "User Logged in sucessFully..!" })
        }
        return res.status(401).json({"pass":false,"message":"Incorrect Credentials"})

    } catch (error) {
        console.log("Error while Loging In: " + error)
        res.status(500).json({ "pass": false, message: "Internal Server Error" });
    }
}