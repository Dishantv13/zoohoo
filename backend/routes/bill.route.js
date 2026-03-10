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

router.route("/").post(createBill).get(getBills);

router
  .route("/:billId")
  .get(getBillById)
  .put(updateBill)
  .delete(deleteBill);

router.route("/:billId/status").patch(updateBillStatus);

router.route("/stats/summary").get(getBillsStats);

export default router;
