import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectToDatabase } from "./lib/db.connectivity.js";
import {app,server} from "./lib/socket.js"  
import path from "path"

dotenv.config(); 

const PORT = process.env.PORT;

const __dirname=path.resolve()

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser()); 



app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if(process.env.NODE_ENV==="production"){
  app.use(express.static(path.join(__dirname,"../client/dist")))
  app.get("*",(req,resp)=>{
    resp.sendFile(path.join(__dirname,"../client","dist","index.html"))
  })
}



server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}: http://localhost:${PORT}`);
  connectToDatabase();
});


 