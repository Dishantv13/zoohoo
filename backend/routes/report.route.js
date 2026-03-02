import { dashboardController } from "../controller/report.controller.js";
import { Router } from "express";
import { protect,adminOnly } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.route("/report").get(adminOnly, dashboardController);

export default router;