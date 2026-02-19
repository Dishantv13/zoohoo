import { Router } from "express";
import {
  getCurrentUserProfile,
  updateUserProfile,
  deleteProfile,
  changePassword,
} from "../controller/user.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// router.route('/').post(createCustomer);
// router.route("/").get(protect, getCustomer);
router.route("/profile").delete(protect, deleteProfile);
router.route("/profile").get(protect, getCurrentUserProfile);
router.route("/profile").put(protect, updateUserProfile);
router.route("/change-password").put(protect, changePassword);

export default router;
