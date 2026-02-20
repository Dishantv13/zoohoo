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
} from "../controller/user.controller.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);

router.route("/admin/register").post(adminRegister);

router.route("/customers").post(protect, adminOnly, createCustomer);
router.route("/customers").get(protect, adminOnly, getCompanyCustomers);
router.route("/customers/:customerId").put(protect, adminOnly, updateCustomer);
router.route("/customers/:customerId").delete(protect, adminOnly, deleteCustomer);

router.route("/me").get(protect, getCurrentUserProfile);

export default router;
