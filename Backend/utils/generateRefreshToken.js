
import jwt from 'jsonwebtoken'
import config from '../config/config.js'


const generateRefreshToken = (user,sessionId) => {

    const token = jwt.sign({id:user._id,sessionId :sessionId} ,config.REFRESHTOKEN_SECRET,{
        expiresIn : "7d"
    })

    return token;



}

export default generateRefreshToken
