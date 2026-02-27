import { Router } from "express";
import {
  processCardPayment,
  processQRPayment,
  getPaymentStatus,
  getInvoicePaymentHistory,
  processCashPayment,
} from "../controller/payment.controller.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.route("/card").post(processCardPayment);
router.route("/qr").post(processQRPayment);
router.route("/:invoiceId/status").get(getPaymentStatus);
router.route("/:invoiceId/history").get(getInvoicePaymentHistory);

router.route("/cash").post(adminOnly, processCashPayment);

export default router;
