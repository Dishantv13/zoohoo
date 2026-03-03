import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";
import { asyncHandler } from "../util/asyncHandler.js";
import ApiError from "../util/apiError.js";

export const socketAuth = asyncHandler(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      throw new ApiError(401, "Not authorized to access this route");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    socket.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Authentication failed. Please login again.");
  }
});
