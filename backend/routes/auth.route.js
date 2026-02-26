import express from "express";
import {
  register,
  login,
  adminRegister,
  createCustomer,
  getCompanyCustomers,
  updateCustomer,
  deleteCustomer,
  getCurrentUserProfile,
  logout,
} from "../controller/user.controller.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/admin/register").post(adminRegister);

router.use(protect);
router.route("/logout").post(logout);
router.route("/customers").post(adminOnly, createCustomer);
router.route("/customers").get(adminOnly, getCompanyCustomers);
router.route("/customers/:customerId").put(adminOnly, updateCustomer);
router.route("/customers/:customerId").delete(adminOnly, deleteCustomer);

router.route("/me").get(getCurrentUserProfile);

export default router;
