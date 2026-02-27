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

router.use(protect);

router.route("/").post(createInvoice);
router.route("/").get(getInvoices);

router.route("/:id").get(getInvoiceById);
router.route("/:id").put(updateInvoice);
router.route("/:id/status").patch(updateInvoiceStatus);
router.route("/:id").delete(deleteInvoice);
router.route("/:id/download").get(downloadInvoice);

router.route("/admin/all").get(adminOnly, getAdminAllInvoices);
router
  .route("/admin/customer/:customerId")
  .get(adminOnly, getCustomerInvoicesByAdmin);

router.route("/export").get(exportRateLimiter, exportInvoice);

export default router;
