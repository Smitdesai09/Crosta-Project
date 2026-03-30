const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req,res) => {
    try {
        const {name,email,password} = req.body;
        
        const existingUser = await User.findOne({email});
        
        if(existingUser) {
            return res.status(400).json({
                success : false,
                message : "User already exists with this email!"
            });
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const user = await User.create({
            name,
            email,
            passowrd : hashedPassword
        });

        res.status(200).json({
            success : true,
            message : "User Registered Successfully, Wait for Admin Approval!"
        });

    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
}


exports.loginUser = async (req,res) => {
    try { 
        const {email,password} = req.body;

        const user = await User.findOne({email}).select("+password");

        if(!user) {
            return res,status(404).json({success:false,message:"User Not Found!"});
        }

        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch) {
            return res.status(401).json({
                success : false,
                message : "Invalid Credentials!"
            })
        }

        if(user.status === "pending") {
            return res.status(403).json({
                success : false,
                message : "Please wait for admin approval!"
            });
        }

        if(user.status === "rejected") {
            return res.status(403).json({
                success : false,
                message : "Your registration request has been rejected by admin!"
            });
        }

        const token = jwt.sing(
            {id : user._id},
            process.env.JWT_SECRET,
            {expiresIn : "30d"}
        );

        res.status(200).json({
            success : true,
            message : "User Logged In Successfully!",
            token
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
}

exports.getMe = async (req,res) => {
    try {
        res.status(200).json({
            succcess : true,
            data : req.user
        });
    }  catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
}

exports.getAllUsers = async (req,res) => {
    try { 
        const users = await User.find();
        res.status(200).json({
            success : true,
            message : "Data Fetched Successfully!",
            data : users,
            count : users.length
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        })
    }
}

exports.getOneUser = async (req,res) => {
    try {
        const user = await User.findOne({_id:req.params.id});

        if(!user) {
            return res.status(404).json({
                success : false,
                message : "User Not Found!"
            });
        }

        res.status(200).json({
            success : true,
            data : user
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        })
    }  
}


exports.approveUser = async (req,res) => {
    try {
        const user = await User.findOne({_id : req.params.id});

        if(!user) {
            return res.status(404).json({
                success : false,
                message : "User Not Found!"
            })
        }

        if(user.status === "active") {
            return res.status(400).json({
                success : false,
                message : "User is already approved!"                   
            });
        }

        user.status = "active";
        user.approvedAt = Date.now();

        await user.save();
        res.status(200).json({
            success : true,
            message : "User Approved Successfully!"
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        })
    }
}


exports.rejectUser = async (req,res) => {
    try {
        const user = await User.findOne({_id : req.params.id});

        if(!user) {
            return res.status(404).json({
                success : false,
                message : "User Not Found!"
            });
        }

        if(user.status === "rejected") {
            return res.status(400).json({
                success : false,
                message : "User is already rejected!"
            });
        }

        user.status = "rejected";
        await user.save();

        res.status(200).json({
            success : true,
            message : "User Rejected Successfully!"
        });
        
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        })
    }
}