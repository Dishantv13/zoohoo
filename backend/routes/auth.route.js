import express from "express";
import {
  register,
  login,
  getCurrentUserProfile,
} from "../controller/user.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/me").get(protect, getCurrentUserProfile);

export default router;
