import { Router } from "express";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  downloadInvoice,
  getAdminAllInvoices,
  getCustomerInvoicesByAdmin,
  exportInvoice,
} from "../controller/invoice.controller.js";
import { protect, adminOnly } from "../middleware/auth.js";

import { exportRateLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.route("/").post(protect, createInvoice);
router.route("/").get(protect, getInvoices);

router.route("/export").get(protect, exportRateLimiter, exportInvoice);

router.route("/admin/all").get(protect, adminOnly, getAdminAllInvoices);
router
  .route("/admin/customer/:customerId")
  .get(protect, adminOnly, getCustomerInvoicesByAdmin);

router.route("/:id").get(protect, getInvoiceById);
router.route("/:id").put(protect, updateInvoice);
router.route("/:id/status").patch(protect, updateInvoiceStatus);
router.route("/:id").delete(protect, deleteInvoice);
router.route("/:id/download").get(protect, downloadInvoice);

export default router;