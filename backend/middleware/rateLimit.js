import rateLimit from "express-rate-limit";
import ApiError from "../util/apiError.js";

const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(
      new ApiError(
        429,
        "Too many login attempts from this IP, please try again after 10 minutes",
      ),
    );
  },
});

const apiRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(
      new ApiError(
        429,
        "Too many API requests from this IP, please try again after 10 minutes",
      ),
    );
  },
});

const exportRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(
      new ApiError(
        429,
        "Too many export requests from this IP, please try again after 10 minutes",
      ),
    );
  },
});

export { authRateLimiter, apiRateLimiter, exportRateLimiter };
