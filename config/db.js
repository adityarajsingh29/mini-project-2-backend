import mongoose from "mongoose";

/**
 * Connects to MongoDB using the URI defined in environment variables.
 * The process exits if the initial connection fails, since the API
 * cannot serve history/favorites data without a database.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
