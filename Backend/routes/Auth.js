const express = require('express');
const { registerUser, loginUser } = require('../controller/User');
const { validate } = require('../middleware/validate');
const Router = express.Router();
const {z} = require('zod');

const registerSchema = z.object({
        body:z.object({
            name:z.string().min(4),
            email:z.string().email(),
            password:z.string().min(6)
        })
})

const loginSchema = z.object({
    body:z.object({
        email:z.string().email(),
        password:z.string().min(6)
    })
})

Router.post('/user/register',validate(registerSchema),registerUser);

Router.post('/user/login',validate(loginSchema),loginUser)

module.exports = Router;