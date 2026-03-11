import { Router } from "express";
import {
  createInventoryItem,
  getInventoryItems,
  updateInventoryItem,
  deleteInventoryItem,
  getVendorAvailability,
} from "../controller/item.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.route("/").post(createInventoryItem).get(getInventoryItems);
router.route("/availability/:vendorId").get(getVendorAvailability);
router.route("/:itemId").put(updateInventoryItem).delete(deleteInventoryItem);

export default router;
