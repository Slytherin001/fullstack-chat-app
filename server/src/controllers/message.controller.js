import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, resp) => {
  try {
    const loggedInUserId = req.user?._id;
    if (!loggedInUserId) {
      return resp
        .status(400)
        .json({ success: false, message: "User not authenticated" });
    }

    const usersWithLastMessage = await User.aggregate([
      {
        $match: {
          _id: { $ne: loggedInUserId },
        },
      },
      {
        $lookup: {
          from: "messages",
          let: { userId: "$_id", loggedInUserId },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    {
                      $and: [
                        { $eq: ["$senderId", "$$loggedInUserId"] },
                        { $eq: ["$receiverId", "$$userId"] },
                      ],
                    },
                    {
                      $and: [
                        { $eq: ["$senderId", "$$userId"] },
                        { $eq: ["$receiverId", "$$loggedInUserId"] },
                      ],
                    },
                  ],
                },
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
          ],
          as: "lastMessage",
        },
      },
      {
        $lookup: {
          from: "messages",
          let: { userId: "$_id", loggedInUserId },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$receiverId", "$$loggedInUserId"] },
                    { $eq: ["$senderId", "$$userId"] },
                    { $eq: ["$read", false] },
                  ],
                },
              },
            },
          ],
          as: "unreadMessages",
        },
      },
      {
        $project: {
          fullName: 1,
          email: 1,
          profilePic: 1,
          lastMessage: { $arrayElemAt: ["$lastMessage", 0] },
          unreadCount: { $size: "$unreadMessages" },
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
    ]);

    resp.status(200).json({
      success: true,
      usersWithLastMessage,
    });
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error);
    return resp.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMessages = async (req, resp) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    resp.status(200).json(messages);
  } catch (error) {
    return resp.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const sendMessage = async (req, resp) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      //upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    io.emit("updateLastMessage", {
      senderId,
      receiverId,
      newMessage,
    });

    resp.status(201).json(newMessage);
  } catch (error) {
    return resp.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { senderId } = req.body; // Sender ID
    const receiverId = req.user._id; // Logged-in user as receiver

    const reuslt = await Message.updateMany(
      { receiverId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in markMessagesAsRead:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
