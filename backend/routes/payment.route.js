import { Router } from "express";
import {
  processCardPayment,
  processQRPayment,
  getPaymentStatus,
} from "../controller/payment.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.route("/card").post(protect, processCardPayment);
router.route("/qr").post(protect, processQRPayment);
router.route("/:invoiceId/status").get(protect, getPaymentStatus);

export default router;
