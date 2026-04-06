const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

dotenv.config()
connectDB()

const app = express()

app.use(cookieParser());
app.use(express.json());

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true //  allows cookies
}));
app.use("/api/product",require("./routes/productRoute"));
app.use("/api/auth",require("./routes/authRoute"));
app.use("/api/user",require("./routes/userRoute"));
app.get("/",(req,res)=>{
    res.send({message : "Product API is running successfully!"});
})

app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});
const PORT = process.env.PORT || 5000

app.listen(PORT, ()=>{
    console.log(`Server is running on PORT ${PORT}`);
});
