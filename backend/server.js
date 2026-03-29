const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config()
connectDB()

const app = express()

app.use(cors())
app.use(express.json());

app.use("/api/product",require("./routes/productRoute"));

app.get("/",(req,res)=>{
    res.send({message : "Product API is running successfully!"});
})

const PORT = process.env.PORT || 5000

app.listen(PORT, ()=>{
    console.log(`Server is running on PORT ${PORT}`);
});
