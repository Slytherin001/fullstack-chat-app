import User from "../models/user.model.js";
import { decryptPassword, hashingPassword } from "../lib/hashing.password.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, resp) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return resp.status(400).json({
        success: false,    
        message: "All fields is mandatory",
      });
    }

    const user = await User.findOne({ email });

    if (user) {
      return resp.status(400).json({
        success: false,
        message: "Email already exists", 
      });
    }
    
    const newUser = new User({
      fullName,
      email,
      password: await hashingPassword(password),
    });

    if (newUser) {
      generateToken(newUser._id, resp);
      await newUser.save();
      resp.status(201).json({
        success: true,
        message: "User has been created successfully",
        newUser, 
      });
    } else {
      return resp.status(400).json({
        success: false,  
        message: "something went wrong while creating user", 
      });
    }
  } catch (error) {
    return resp.status(500).json({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};

export const login = async (req, resp) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return resp.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isCorrect = await decryptPassword(password, user.password);

    if (!isCorrect) {
      return resp.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    generateToken(user._id, resp);

    resp.status(200).json({
      success: true,
      message: "User login successfully",
      user,
    });
  } catch (error) {
    console.log(error)
    return resp.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logout = (req, resp) => {
  try {
    resp.cookie("jwt", "", { maxAge: 0 });
    resp.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return resp.satus(500).json({
      success: false,
      message: "Internal server error",
    }); 
  }
};



export const updateProfile = async (req, resp) => {
  try {
    const { profilePic, fullName } = req.body;
    const userId = req.user._id;

    if (fullName === "") {
      return resp.status(400).json({
        success: false,
        message: "Full name is required",
      });
    }

    const updateData = {};
    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updateData.profilePic = uploadResponse.secure_url;
    }
    if (fullName) {
      updateData.fullName = fullName;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    resp.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return resp.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};






export const checkAuth = (req, resp) => {
  try {
    resp.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return resp.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
