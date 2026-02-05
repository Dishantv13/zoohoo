import { Router } from "express";
import {getCustomer,createCustomer} from "../controller/user.controller.js"

const router = Router()

router.route("/").get(getCustomer)
router.route("/").post(createCustomer)

export default router
