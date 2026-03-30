const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req,res) => {
    try {

        if(req.user.role !== "admin") {
            return res.status(403).json({
                success : false,
                message : "Only Admins can register new users!"
            });
        }
        
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

        res.status(201).json({
            success : true,
            message : "User Registered Successfully!"
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

exports.updateUser = async (req,res) => {
    try {
        const userId = req.params.id;

        const user = await User.findOne({_id : user}).select("+password");

        if(!user) {
            return res.status(404).json({
                success : false,
                message : "User Not Foudn!"
            });
        }

        const {name,email,password} = req.body;

        if(name) user.name = name;
        if(email) user.email = email;

        await user.save();
        res.status(200).json({
            success : true,
            message : "User Updated Successfully!",
            data : user
        });

    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        })
    }
}


exports.deleteUser = async (req,res) => {
    try {
        const userId = req.params.id;

        const user = await User.findOne({_id : userId});

        if(!user) {
            return res.status(404).json({
                success : false,
                message : "User Not Found!" 
            });
        }

        await User.deleteOne();

        res.status(200).json({
            success : true,
            message : "User Deleted Successfully!"
        });

    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
}