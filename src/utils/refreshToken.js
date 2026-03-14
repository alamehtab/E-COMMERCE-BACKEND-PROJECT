const jwt=require("jsonwebtoken")

const generateRefreshToken=async(userId)=>{
    return jwt.sign(
        {id:userId},
        process.env.JWT_REFRESH_SECRET,
        {expiresIn:"7d"}
    )
}
module.exports = generateRefreshToken;