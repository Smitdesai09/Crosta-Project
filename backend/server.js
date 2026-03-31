const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const OrderRoutes = require("./routes/OrderRoutes");
const BillRoutes = require("./routes/BillRoutes");
const ProductRoutes = require("./routes/ProductRoutes");

dotenv.config()
connectDB()
const app = express()
app.use(cors())
app.use(express.json());


//routes
app.use("/api/orders", OrderRoutes);
app.use("/api/bills", BillRoutes)
app.use("/api/products", ProductRoutes);


const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server Runnig On ${PORT}`))




