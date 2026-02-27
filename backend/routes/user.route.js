import { Router } from "express";
import {
  getCurrentUserProfile,
  updateUserProfile,
  deleteProfile,
  changePassword,
  createCustomer,
  getCompanyCustomers,
  updateCustomer,
  deleteCustomer,
} from "../controller/user.controller.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.route("/profile").get(getCurrentUserProfile);
router.route("/update-profile").put(updateUserProfile);
router.route("/delete-profile").delete(deleteProfile);
router.route("/change-password").put(changePassword);

router.route("/create-customers").post(adminOnly, createCustomer);
router.route("/get-customers").get(adminOnly, getCompanyCustomers);
router.route("/update-customers/:customerId").put(adminOnly, updateCustomer);
router.route("/delete-customers/:customerId").delete(adminOnly, deleteCustomer);

export default router;
