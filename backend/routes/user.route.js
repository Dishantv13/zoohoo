import { Router } from "express";
import {
  createCustomer,
  getCustomer,
  getCurrentUserProfile,
  updateUserProfile,
  deleteProfile
} from '../controller/user.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.route('/').post(createCustomer);
router.route("/profile").get(protect, getCurrentUserProfile);
router.route("/profile").put(protect, updateUserProfile);
router.route("/").get(protect, getCustomer);
router.route("/profile").delete(protect, deleteProfile)

export default router;
