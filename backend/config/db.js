const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    const mongoUri =
       process.env.MONGO_URI || "mongodb://127.0.0.1:27017/crosta_store";

    const connection = await mongoose.connect(mongoUri);
    console.log(
      `MongoDB connected on ${connection.connection.host}:${connection.connection.port}/${connection.connection.name}`
    );
    return connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

