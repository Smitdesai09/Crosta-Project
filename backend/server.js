const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const billRoutes = require("./routes/billRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

dotenv.config()
connectDB()

const app = express()
app.use(cookieParser());
app.use(express.json());

app.use(cors({
    // origin: process.env.CLIENT_URL || "http://localhost:3000",
    origin: "https://crosta-project-lcploy10q-rutvik1546s-projects.vercel.app/",
    credentials: true //  allows cookies
}));


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




