const jwt = require('jsonwebtoken');

exports.verifyToken = (req,res,next)=>{
    const token = req.headers["authorization"] && req.headers["authorization"].split(" ");
    if(!token){
    return res.status(401).json({"pass":false,"message":"No Token Was Provided In the request..!"})
    } 

    try{
        const decode = jwt.verify(token[1],process.env.JWT_SECRET_KEY)
        req.user = decode;
        next(); 
    }catch(error){
        console.log(error);
        res.status(401).json({"pass":false,message:"Invalid Token"});
    }  
}