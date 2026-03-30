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
    }
}, {timestamps : true});

module.exports = mongoose.model("User",userSchema);