import mongoose from "mongoose";

export const connectToDatabase = async () => {
  const MongoURI = process.env.MONGODB_URI; 
  try {
    const conn = await mongoose.connect(MongoURI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("Something went wrong", error);
  }
};
