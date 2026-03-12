import {
  dashboardController,
  monthlyRevenueController,
  yearlyRevenueController,
  todayRevenueController,
  topCustomersController,
  monthlyExpenseController,
  yearlyExpenseController,
  todayExpenseController,
  topVendorsController,

} from "../controller/report.controller.js";
import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

router.use(protect, adminOnly);

router.route("/dashboard").get(dashboardController);
router.route("/monthly-revenue").get(monthlyRevenueController);
router.route("/yearly-revenue").get(yearlyRevenueController);
router.route("/today-revenue").get(todayRevenueController);
router.route("/top-customers").get(topCustomersController);

router.route("/monthly-expense").get(monthlyExpenseController);
router.route("/yearly-expense").get(yearlyExpenseController);
router.route("/today-expense").get(todayExpenseController);
router.route("/top-vendors").get(topVendorsController);

export default router;
