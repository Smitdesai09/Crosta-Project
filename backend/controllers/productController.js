const Product = require("../models/products");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);



exports.getAllProducts = async (req,res) => {
    try {
        const products = await Product.find({isAvailable:true})
        res.status(200).json({success:true,message:"Data Fetched Successfully",data:products});

    } catch (error) {
        res.status(500).json({success:false,message:error.message});
    }
}

exports.createProduct = async (req,res) => {
    try {
        const {name,category,variants} = req.body;

        if (!name || !category || !variants) {
            return res.status(401).json({success:false,message:'All Feilds are required!'});
        }
        const product = await Product.create({
            name,
            category,
            variants
        });

        res.status(200).json({success:true,message: "Product Added Successfully!"});
    } catch (error) {
        res.status(500).json({success:false,message:error.message});
    }
}

exports.updateProduct = async (req,res) => {
    try {
     const {name,category,variants} = req.body;
     const {id} = req.params;

     if(!idValidId(id)) {
        return res.status(400).json({
            success : false,
            message : "Invalid Product ID"
        });
     }
   
    if (!name || !category || !variants || variants.length === 0 ) {
        return res.status(401).json({success:false,message:"All Fields are required!"});
    }

    for (let v of variants) {
        if (!v.name || !v.price) {
            return res.status(400).json({
                success : false,
                message : "Each Variant must have size and price"
            })
        }

        if(isNaN(v.price)) {
            return res.status(400).json({
                success : false,
                message : "Price must be a number"
            })
        }
    }
    const updatedProduct = await Product.findByIdAndUpdate(
        id,
        {name,category,variants},
        {new:true,runValidators: true}   //It will check schema rules again
    );

    if(!updatedProduct) {
        return res.status(404).json({
            success : false,
            message : "Product not found!"
        });
    }

    res.status(200).json({
        success:true,
        message : "Product Updated successfully",
        data:updatedProduct
    });
   } catch(error) {
        res.status(500).json({success:false,message:error.message})
   }
}

exports.deleteProduct = async (req,res) => {
    try{
        const productId = req.params.id;

        if(!isValidId(productId)) {
            return res.status(400).json({
                success : false,
                message : "Invalid Product ID!"
            })
        }

        const deletedProduct = await Product.findOneAndUpdate(
            {_id : productId , isDeleted : false},
            {idDeleted : true},
            {new : true}
        );

        // const deletedProduct = await Product.findByIdAndDelete(req.params.id);

        if(!deletedProduct) {
            return res.status(404).json({
                success:false,
                message:"Product not Found!"
            })
        }
        
        res.status(200).json({
            success:true,
            message:"Product Deleted Successfully!"
        });
    } catch(error) {
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
}


exports.restoreProduct = async(req,res)=>{
    try {
        const productId = req.params.id;

        if(!isValidId(productId)) {
            return res.status(400).json({
                success : false,
                message : "Invalid product ID"
            });
        }


        const restoreProduct = await Product.findOneAndUpdate(
            {_id : productId, isDeleted : true},
            {idDeletd : false},
            {new : true}
        );

        if(!restoreProduct) {
            return res.status(404).json({
                success : false,
                message : "Product Not Found or Already Active"
            });
        }

        res.status(200).json({
            success : true,
            message : "Product Restored successfully!"
        });


    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        })
    }
}


// exports.getOneProduct = async (req,res) => {
//     try {
//         // const product = await Product.findById(req.params.id)
//         const product = await Product.findOne({_id:req.params.id,isAvailable:true});

//         if(!product) {
//             return res.status(404).json({success:false,message:"Product Not Found!"});
//         }

//         res.status(200).json({success:true,data:product});
//     } catch(error) {
//         res.status(500).json({success:false,message:error.message})
//     }
// }