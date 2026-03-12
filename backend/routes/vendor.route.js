import { Router } from "express";
import {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  getVendorBills,
  getVendorStats,
} from "../controller/vendor.controller.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.use(adminOnly);

router.route("/").post(createVendor).get(getVendors);

router
  .route("/:vendorId")
  .get(getVendorById)
  .put(updateVendor)
  .delete(deleteVendor);

router.route("/:vendorId/bills").get(getVendorBills);
router.route("/:vendorId/stats").get(getVendorStats);

export default router;
