import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/message.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

//used to store online users
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("A user connection", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
    const newMessage = await Message.create({ senderId, receiverId, text,createAt:new Date(),read:false });


    const unreadCount=await Message.countDocuments({
      senderId,
      receiverId,
      read:false
    })
    
    const receiverSocketId=userSocketMap[receiverId];
    if(receiverSocketId){
      io.to(receiverSocketId).emit("unreadCountUpdate",{senderId,unreadCount})
    }
    
    

    // Emit to all clients the new last message
    io.emit("updateLastMessage", {
      senderId,
      receiverId,
      newMessage,
    });
  });

  socket.on("markAsRead", async ({ senderId, receiverId }) => {
    // Update all unread messages in the database
    await Message.updateMany(
      { senderId, receiverId, read: false },
      { $set: { read: true } }
    );
  });

  
  
  

  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId });
    }
  });

  socket.on("stopTyping", ({ senderId, receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { senderId });
    }
  });

  
  

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
}); 

export { io, app, server };
