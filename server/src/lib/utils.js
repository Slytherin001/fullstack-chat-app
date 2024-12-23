import jwt from "jsonwebtoken"

export const generateToken=async(userId,resp)=>{
    const token=jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:'7d'
    })
    resp.cookie('jwt',token,{
        maxAge:7*24*60*60*1000, 
        httpOnly:true, 
        sameSize:"strict", 
        secure:process.env.NODE_ENV !== "development"
    })
    return token  
}

