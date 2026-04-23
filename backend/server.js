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
  origin: "https://crosta-project-3.onrender.com",
  credentials: true
}));


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://crosta-project-3.onrender.com");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});


app.use(cookieParser());
app.use(express.json());

// app.options("*", cors());

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




