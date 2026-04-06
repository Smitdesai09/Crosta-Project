const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const OrderRoutes = require("./routes/OrderRoutes");
const BillRoutes = require("./routes/BillRoutes");
const ProductRoutes = require("./routes/ProductRoutes");
const DashboardRoutes = require("./routes/dashboardRoutes");
const AnalyticsRoutes = require("./routes/AnalyticsRoutes");

dotenv.config()
connectDB()
const app = express()
app.use(cors())
app.use(express.json());


//routes
app.use("/api/orders", OrderRoutes);
app.use("/api/bills", BillRoutes)
app.use("/api/products", ProductRoutes);
app.use("/api/dashboard", DashboardRoutes);
app.use("/api/analytics", AnalyticsRoutes);

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server Runnig On ${PORT}`))




