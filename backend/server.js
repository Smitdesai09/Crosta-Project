const express = require('express')
const dotenv = require('dotenv')
const connection = require('./config/connection')
const cors = require('cors')
const OrderRoutes = require("./routes/OrderRoutes");
const BillRoutes = require("./routes/BillRoutes");

dotenv.config()
connection()
const app = express()
app.use(express.json())


//routes
app.use("/api/orders", OrderRoutes);
app.use("/api/bills", BillRoutes)


const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server Runnig On ${PORT}`))