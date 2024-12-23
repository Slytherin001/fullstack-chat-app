import bcrypt from "bcryptjs"

export const hashingPassword=async(password)=>{
    const saltRound=await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(password,saltRound)
    return hashedPassword; 
}

export const decryptPassword=async(password,userPassword)=>{
    const isPasswordCorrect=await bcrypt.compare(password,userPassword);
    return isPasswordCorrect;
}