import { Router } from "express";
import {
  createBill,
  getBills,
  getBillById,
  updateBill,
  deleteBill,
  updateBillStatus,
  getBillsStats,
} from "../controller/bill.controller.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.use(adminOnly); 

router.route("/stats/summary").get(getBillsStats);

router.route("/").post(createBill).get(getBills);

router
  .route("/:billId/status")
  .patch(updateBillStatus);

router
  .route("/:billId")
  .get(getBillById)
  .put(updateBill)
  .delete(deleteBill);

export default router;
