import { Router } from "express";
import {createInvoice,
        getInvoices,
        getInvoiceById,
        updateInvoice,
        deleteInvoice
} from "../controller/invoice.controller.js"

const router = Router()

router.route("/").post(createInvoice)
router.route("/").get(getInvoices)
router.route("/:id").get(getInvoiceById)
router.route("/:id").put(updateInvoice)
router.route("/:id").delete(deleteInvoice)

export default router
