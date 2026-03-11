import { Router } from "express";
import {
  processCardPayment,
  processQRPayment,
  getPaymentStatus,
  getInvoicePaymentHistory,
  processCashPayment,
  getBillPaymentHistory,
} from "../controller/payment.controller.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.route("/card").post(processCardPayment);
router.route("/qr").post(processQRPayment);
router.route("/:invoiceId/status").get(getPaymentStatus);
router.route("/:invoiceId/history").get(getInvoicePaymentHistory);
router.route("/bill/:billId/history").get(getBillPaymentHistory);

router.route("/cash").post(adminOnly, processCashPayment);

export default router;
