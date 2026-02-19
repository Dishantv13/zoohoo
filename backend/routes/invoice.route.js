import { Router } from "express";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  downloadInvoice,
} from "../controller/invoice.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.route("/").post(protect, createInvoice);
router.route("/").get(protect, getInvoices);
router.route("/:id").get(protect, getInvoiceById);
router.route("/:id").put(protect, updateInvoice);
router.route("/:id/status").patch(protect, updateInvoiceStatus);
router.route("/:id").delete(protect, deleteInvoice);
router.route("/:id/download").get(protect, downloadInvoice);

export default router;
