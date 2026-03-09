import { Router} from "express";
import {
  register,
  login,
  adminRegister,
  logout,
  getCurrentUserProfile,
} from "../controller/user.controller.js";
import { protect } from "../middleware/auth.js";
import { authRateLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.route("/register").post(register);
router.route("/login").post(authRateLimiter, login);
router.route("/admin/register").post(adminRegister);

router.use(protect);

router.route("/logout").post(logout);
router.route("/me").get(getCurrentUserProfile);

export default router;
