import {
  dashboardController,
  monthlyRevenueController,
  yearlyRevenueController,
  todayRevenueController,
  topCustomersController,
} from "../controller/report.controller.js";
import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

router.use(protect, adminOnly);

router.route("/report").get(dashboardController);
router.route("/report/monthly-revenue").get(monthlyRevenueController);
router.route("/report/yearly-revenue").get(yearlyRevenueController);
router.route("/report/today-revenue").get(todayRevenueController);
router.route("/report/top-customers").get(topCustomersController);

export default router;
