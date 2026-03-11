import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";
import { Vendor } from "../model/vendor.model.js";
import { asyncHandler } from "../util/asyncHandler.js";
import ApiError from "../util/apiError.js";

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new ApiError(401, "Not authorized to access this route");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.accountType === "vendor") {
        const vendor = await Vendor.findById(decoded.id).select("-password");

        if (!vendor) {
          throw new ApiError(404, "Vendor not found");
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
        throw new ApiError(404, "User not found");
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new ApiError(401, "Token expired. Please login again.");
      } else if (error.name === "JsonWebTokenError") {
        throw new ApiError(401, "Invalid token. Please login again.");
      }
      throw error;
    }
});

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    throw new ApiError(403, "Admin access only");
  }
};

export { protect, adminOnly };
