const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    const mongoUri =
      process.env.MONGO_URI;

    const conn = await mongoose.connect(mongoUri);

    console.log(
      `MongoDB connected on ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`
    );

    return conn;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;