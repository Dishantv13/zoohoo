import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";
import { Vendor } from "../model/vendor.model.js";
import { asyncHandler } from "../util/asyncHandler.js";
import ApiError from "../util/apiError.js";
import { MIDDLEWARE_ERRORS } from "../util/errorMessage.js";

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw MIDDLEWARE_ERRORS.AUTH_REQUIRED();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.accountType === "vendor") {
      const vendor = await Vendor.findById(decoded.id).select("-password");

      if (!vendor) {
        throw MIDDLEWARE_ERRORS.VENDOR_NOT_FOUND();
      }

      req.user = {
        ...vendor.toObject(),
        role: "vendor",
        id: vendor._id,
      };

      next();
      return;
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      throw MIDDLEWARE_ERRORS.USER_NOT_FOUND();
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw MIDDLEWARE_ERRORS.TOKEN_EXPIRED();
    } else if (error.name === "JsonWebTokenError") {
      throw MIDDLEWARE_ERRORS.INVALID_TOKEN();
    }
    throw error;
  }
});

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    throw MIDDLEWARE_ERRORS.ADMIN_ONLY();
  }
};

const socketAuth = asyncHandler(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      throw MIDDLEWARE_ERRORS.AUTH_REQUIRED();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw MIDDLEWARE_ERRORS.USER_NOT_FOUND();
    }

    socket.user = user;
    next();
  } catch (error) {
    throw MIDDLEWARE_ERRORS.INVALID_TOKEN();
  }
});

export { protect, adminOnly, socketAuth };
