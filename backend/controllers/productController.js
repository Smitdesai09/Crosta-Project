const Product = require("../modules/productSchema");

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


exports.getAllProducts = async (req,res) => {
    try {
        const products = await Product.find({isAvailable:true})
        res.status(200).json({success:true,message:"Data Fetched Successfully",data:products});

    } catch (error) {
        res.status(500).json({success:false,message:error.message});
    }
}


exports.getOneProduct = async (req,res) => {
    try {
        // const product = await Product.findById(req.params.id)
        const product = await Product.findOne({_id:req.params.id,isAvailable:true});

        if(!product) {
            return res.status(404).json({success:false,message:"Product Not Found!"});
        }

        res.status(200).json({success:true,data:product});
    } catch(error) {
        res.status(500).json({success:false,message:error.message})
    }
}

exports.updateProduct = async (req,res) => {
   try {
     const {name,category,variants} = req.body;

    if (!name || !category || !variants) {
        return res.status(401).json({success:false,message:"All Fields are required!"});
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {name,category,variants},
        {new:true}
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
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);

        if(!deletedProduct) {
            return res.status(404).json({success:false,message:"Product not Found!"})
        }

        res.status(200).json({success:true,message:"Product Deleted Successfully!"
        });
    } catch(error) {
        res.status(500).json({success:false,message:error.message});
    }
}
