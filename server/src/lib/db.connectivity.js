import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();

export const connectToDatabase = async () => {
  const MongoURI = process.env.MONGODB_URI; 
  try {
    const conn = await mongoose.connect(MongoURI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("Something went wrong", error);
  }
};
 