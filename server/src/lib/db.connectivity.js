import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();

export const connectToDatabase = async () => {
  const MongoURI = process.env.MONGODB_URI; 
  try {
    const conn = await mongoose.connect(MongoURI,{ useNewUrlParser: true, useUnifiedTopology: true });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("Something went wrong", error);
  }
};
 