import rateLimit from "express-rate-limit";
import ApiError from "../util/apiError.js";
import { RATELIMIT_ERRORS } from "../util/errorMessage.js";

const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(RATELIMIT_ERRORS.TOO_MANY_REQUESTS());
  },
});

const apiRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(RATELIMIT_ERRORS.TOO_MANY_REQUESTS());
  },
});

const exportRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(RATELIMIT_ERRORS.TOO_MANY_REQUESTS());
  },
});

export { authRateLimiter, apiRateLimiter, exportRateLimiter };
