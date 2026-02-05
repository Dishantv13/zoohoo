import { Router } from "express";
import {createInvoice,getInvoices} from "../controller/invoice.controller.js"

const router = Router()

router.route("/").post(createInvoice)
router.route("/").get(getInvoices)

export default router
