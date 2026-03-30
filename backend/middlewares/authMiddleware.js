const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticated = async (req,res,next) => {
    try {
        const authHeader = req.headers.authorization || "";
        
        if(!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success:false,
                message:"Unauthorized Access!"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        const user = await User.findOne({_id:decoded.id});

        if(!user) {
            return res.status(401).json({
                success:false,
                message:"User not found!"
            })
        }

        req.user = user;
        next();

    } catch (error) {
        res.status(401).json({
            success : false,
            message : "Invalid or Expired Token!"
        })
    }
}