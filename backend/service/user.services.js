import { User } from "../model/user.model.js";
import jwt from "jsonwebtoken";

const loginService = async (userData) => {
  const { email, password } = userData;

  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return {
    success: true,
    message: "User Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  };
};

const registerService = async (userData) => {
  const { name, email, password, phonenumber, address } = userData;

  if (!name || !email || !password) {
    throw new Error("Please provide name, email and password");
  }
  const userExists = await User.findOne({ email: email.toLowerCase() });

  if (userExists) {
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phonenumber,
    address,
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return {
    success: true,
    message: "User registered successfully",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      address: user.address,
    },
  };
};

// const createCustomerService = async (userData) => {
//   const { name, email, password, phonenumber } = userData;

//   if (!name || !email || !password) {
//     throw new Error("Please provide name, email and password");
//   }

//   const userExists = await User.findOne({ email });
//   if (userExists) {
//     throw new Error("Email already registered");
//   }

//   const user = await User.create({
//     name,
//     email,
//     password,
//     phonenumber,
//   });

//   return user;
// };

const getCurrentUserProfileService = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// const getCustomerService = async (data) => {
//   const customers = await User.find().select("-password");
//   return customers;
// };

const updateUserProfileService = async (userId, updateData) => {
  const { name, email, phonenumber, address } = updateData;

  const user = await User.findByIdAndUpdate(
    userId,
    { name, email, phonenumber, address },
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
    throw new Error("Please provide current and new password");
  }

  if (newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters");
  }

  if (currentPassword === newPassword) {
    throw new Error("New password cannot be the same as current password");
  }

  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordMatch = await user.matchPassword(currentPassword);

  if (!isPasswordMatch) {
    throw new Error("Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  return {
    success: true,
    message: "Password updated successfully",
  };
};

export {
  loginService,
  registerService,
  // createCustomerService,
  getCurrentUserProfileService,
  // getCustomerService,
  updateUserProfileService,
  deleteProfileService,
  changePasswordService,
};
