import { verifyToken } from "./auth";

export const authenticateUser = (req,res,next)=>{
    const token = req.headers.authorization;
    if(!token){
        return res.status(401).json({message:"Unauthorized"});
    }
    const decoded = verifyToken(token);
    if(!decoded){
        return res.status(401).json({message:"Unauthorized"});
    }
    req.user = decoded;
    next();
}