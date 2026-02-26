import rateLimit from "express-rate-limit";
import ApiResponse from "../util/apiResponse.js";

const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res
      .status(429)
      .json(
        new ApiResponse(
          429,
          "Too many requests from this IP, please try again after 10 minutes",
        ),
      );
  },
});

const apiRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res
      .status(429)
      .json(
        new ApiResponse(
          429,
          "Too many requests from this IP, please try again after 10 minutes",
        ),
      );
  },
});

const exportRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res
      .status(429)
      .json(
        new ApiResponse(
          429,
          "Too many export requests from this IP, please try again after 10 minutes",
        ),
      );
  },
});

export { 
    authRateLimiter, 
    apiRateLimiter, 
    exportRateLimiter 
};
