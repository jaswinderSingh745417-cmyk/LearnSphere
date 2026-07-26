import crypto from 'crypto'

const hashToken =(refreshToken)=>{
    const token = crypto.createHash("sha256").update(refreshToken).digest("hex")

    return token;

}

export default hashToken