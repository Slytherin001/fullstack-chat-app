import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectedRoute = async (req, resp,next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return resp.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return resp.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return resp.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return resp.status(500).json({
        success:false,
        message:"Internal server error"
    })
  }
};

