import { User } from "../model/user.model.js";
import jwt from "jsonwebtoken";

const loginService = async (userData) => {
  const { email, password } = userData;

  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  if (!user) {
    return { success: false, message: "Invalid email or password" };
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return { success: false, message: "Invalid email or password" };
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return {
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  };
};

const registerService = async (userData) => {
  const { name, email, password, phonenumber } = userData;

  if (!name || !email || !password) {
    return {
      success: false,
      message: "Please provide name, email and password",
    };
  }
  const userExists = await User.findOne({ email: email.toLowerCase() });

  if (userExists) {
    return { success: false, message: "User already exists" };
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phonenumber,
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return {
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  };
};

const createCustomerService = async (userData) => {
  const { name, email, password, phonenumber } = userData;

  if (!name || !email || !password) {
    throw new Error("Please provide name, email and password");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error("Email already registered");
  }

  const user = await User.create({
    name,
    email,
    password,
    phonenumber,
  });

  return user;
};

const getCurrentUserProfileService = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const getCustomerService = async (data) => {
  const customers = await User.find().select("-password");
  return customers;
};

const updateUserProfileService = async (userId, updateData) => {
  const { name, email, phonenumber } = updateData;

  const user = await User.findByIdAndUpdate(
    userId,
    { name, email, phonenumber },
    { new: true, runValidators: true },
  ).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const deleteProfileService = async (userId) => {
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return { success: true, message: "Account deleted" };
};

const changePasswordService = async (userId, data) => {
  const { currentPassword, newPassword } = data;

  if (!currentPassword || !newPassword) {
    return {
      success: false,
      message: "Current password and new password are required",
    };
  }

  if (newPassword.length < 6) {
    return {
      success: false,
      message: "New password must be at least 6 characters",
    };
  }

  if (currentPassword === newPassword) {
    return {
      success: false,
      message: "New password cannot be the same as current password",
    };
  }

  const user = await User.findById(userId).select("+password");

  if (!user) {
    return { success: false, message: "User not found" };
  }

  const isPasswordMatch = await user.matchPassword(currentPassword);

  if (!isPasswordMatch) {
    return { success: false, message: "Current password is incorrect" };
  }

  user.password = newPassword;
  await user.save();

  return { success: true, message: "Password updated successfully" };
};

export {
  registerService,
  loginService,
  createCustomerService,
  getCurrentUserProfileService,
  getCustomerService,
  updateUserProfileService,
  deleteProfileService,
  changePasswordService,
};
