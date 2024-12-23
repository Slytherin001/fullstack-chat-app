import mongoose from "mongoose";

export const connectToDatabase = async () => {
  const MongoURI = `mongodb+srv://kasproslytherin:ur14scEfMv6DCwvv@cluster0.sfcus.mongodb.net/chat_application
database?retryWrites=true&w=majority&appName=Cluster0`; 
  try {
    const conn = await mongoose.connect(MongoURI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("Something went wrong", error);
  }
};
