const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },

    category : {
        type : String,
        required : true,
        trim : true,
        lowercase : true
    },

    variants : {
        type : [{
            size : {
                type : String,
                required : true
            },
            price : {
                type : String,
                required : true
            }
        }]
    },
    
    isAvailable : {
        type : Boolean,
        default : true
    }
}, {timestamps : true});

module.exports = mongoose.model("Product",productSchema);


// {
//     "name" : "Pizza",
//     "category" : "Food",
//     "variants" : [ {

//         "name" : "Small",
//         "price" : 100
//     }, {
//         "name" : "Medium",
//         "price": 150
//     } , {
//         "name" : "Large",
//         "price" : 200
//     }]
    
// }
// }
