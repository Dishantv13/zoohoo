import { Router } from "express";
import {createInvoice,
        getInvoices,
        getInvoiceById,
        updateInvoice,
        updateInvoiceStatus,
        deleteInvoice
} from "../controller/invoice.controller.js"
import { protect } from "../middleware/auth.js";

const router = Router()

router.route("/").post(protect, createInvoice)
router.route("/").get(protect, getInvoices)
router.route("/:id").get(protect, getInvoiceById)
router.route("/:id").put(protect, updateInvoice)
router.route("/:id/status").patch(protect, updateInvoiceStatus)
router.route("/:id").delete(protect, deleteInvoice)

export default router
