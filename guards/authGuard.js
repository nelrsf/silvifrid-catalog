const jwt = require("jsonwebtoken");
const axios = require('axios');

const authenticate = async (payload) => {
    return await axios.post(process.env.AUTH_MICROSERVICE_URL, payload);
}


const authGuard = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader.split(" ")[1];
    jwt.verify(token, process.env.SECRET, (error, payload)=>{
        if(error){
            console.log(error);
            res.status(401).json(error);
        } else {
            authenticate(payload).then(
                (_response)=>{
                    console.log("user successfully authenticated");
                    console.log(payload);
                    next();
                }
            ).catch(
                (error)=>{
                    console.log(error);
                    res.status(401).json(error);
                }
            );
        }
    });
};


module.exports = authGuard;

