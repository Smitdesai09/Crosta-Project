const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/AuthRoutes");
const userRoutes = require("./routes/UserRoutes");
const productRoutes = require("./routes/ProductRoutes");
const orderRoutes = require("./routes/OrderRoutes");
const billRoutes = require("./routes/BillRoutes");
const dashboardRoutes = require("./routes/DashboardRoutes");
const analyticsRoutes = require("./routes/AnalyticsRoutes");

dotenv.config()
connectDB()

const app = express()
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://crosta-project-frontend.onrender.com"
  ],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());


//routes
app.use("/api/auth",authRoutes);
app.use("/api/user",userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/bills", billRoutes)
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server Runnig On ${PORT}`))




