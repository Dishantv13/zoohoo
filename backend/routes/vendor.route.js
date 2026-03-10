import { Router } from "express";
import {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  getVendorBills,
  getVendorStats,
  vendorLogin,
} from "../controller/vendor.controller.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

// Public route for vendor login
router.route("/login").post(vendorLogin);

// Protected routes - require authentication
router.use(protect);
router.use(adminOnly); // Only admins can manage vendors

// Vendor CRUD operations
router.route("/").post(createVendor).get(getVendors);

router
  .route("/:vendorId")
  .get(getVendorById)
  .put(updateVendor)
  .delete(deleteVendor);

// Vendor bills and statistics
router.route("/:vendorId/bills").get(getVendorBills);
router.route("/:vendorId/stats").get(getVendorStats);

export default router;
