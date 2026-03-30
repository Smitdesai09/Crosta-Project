const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    email : {
        type : String,
        required : true,
        trim : true,
        unique : true,
        lowercase : true
    },
    password : {
        type : String,
        required : true,
        trim : true,
        select : false,    // Mongoose NOT to include that field when fetching data by default
        minlength : 6
    },
    status : {
        type : String,
        enum : ["pending","active","rejected"],
        default : "pending"
    },
    approvedAt : {
        type : Date,
        default : null
    }

}, {timestamps : true});

module.exports = mongoose.model("User",userSchema);