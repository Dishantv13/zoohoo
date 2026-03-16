import {
  dashboardServices,
  monthlyRevenueServices,
  yearlyRevenueServices,
  todayRevenueServices,
  topCustomersServices,
  monthlyExpenseServices,
  yearlyExpenseServices,
  todayExpenseServices,
  topVendorsServices,
} from "../service/report.services.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { successResponse } from "../util/response.js";
import { REPORT_MESSAGES } from "../util/successMessge.js";
import { HTTP_STATUS } from "../util/httpStatus.js";

const dashboardController = asyncHandler(async (req, res) => {
  const { startDate, endDate, month, year, date } = req.query;
  const data = await dashboardServices(req.user._id, {
    startDate,
    endDate,
    month,
    year,
    date,
  });
  successResponse(res, data, HTTP_STATUS.OK, REPORT_MESSAGES.DASHBOARD_DATA);
});

const monthlyRevenueController = asyncHandler(async (req, res) => {
  const { startDate, endDate, month, year } = req.query;
  const data = await monthlyRevenueServices(req.user._id, {
    startDate,
    endDate,
    month,
    year,
  });

  successResponse(res, data, HTTP_STATUS.OK, REPORT_MESSAGES.MONTHLY_REVENUE);
});

const yearlyRevenueController = asyncHandler(async (req, res) => {
  const { startDate, endDate, year } = req.query;
  const data = await yearlyRevenueServices(req.user._id, {
    startDate,
    endDate,
    year,
  });

  successResponse(res, data, HTTP_STATUS.OK, REPORT_MESSAGES.YEARLY_REVENUE);
});

const todayRevenueController = asyncHandler(async (req, res) => {
  const { date, startDate, endDate } = req.query;
  const data = await todayRevenueServices(req.user._id, {
    date,
    startDate,
    endDate,
  });

  successResponse(res, data, HTTP_STATUS.OK, REPORT_MESSAGES.TODAY_REVENUE);
});

const topCustomersController = asyncHandler(async (req, res) => {
  const { startDate, endDate, month, year } = req.query;
  const data = await topCustomersServices(req.user._id, {
    startDate,
    endDate,
    month,
    year,
  });

  successResponse(res, data, HTTP_STATUS.OK, REPORT_MESSAGES.TOP_CUSTOMERS);
});

const monthlyExpenseController = asyncHandler(async (req, res) => {
  const { startDate, endDate, month, year } = req.query;
  const data = await monthlyExpenseServices(req.user._id, {
    startDate,
    endDate,
    month,
    year,
  });
  successResponse(res, data, HTTP_STATUS.OK, REPORT_MESSAGES.MONTHLY_EXPENSES);
});

const yearlyExpenseController = asyncHandler(async (req, res) => {
  const { startDate, endDate, year } = req.query;
  const data = await yearlyExpenseServices(req.user._id, {
    startDate,
    endDate,
    year,
  });
  successResponse(res, data, HTTP_STATUS.OK, REPORT_MESSAGES.YEARLY_EXPENSES);
});

const todayExpenseController = asyncHandler(async (req, res) => {
  const { date, startDate, endDate } = req.query;
  const data = await todayExpenseServices(req.user._id, {
    date,
    startDate,
    endDate,
  });
  successResponse(res, data, HTTP_STATUS.OK, REPORT_MESSAGES.TODAY_EXPENSES);
});

const topVendorsController = asyncHandler(async (req, res) => {
  const { startDate, endDate, month, year } = req.query;
  const data = await topVendorsServices(req.user._id, {
    startDate,
    endDate,
    month,
    year,
  });
  successResponse(res, data, HTTP_STATUS.OK, REPORT_MESSAGES.TOP_VENDORS);
});

export {
  dashboardController,
  monthlyRevenueController,
  yearlyRevenueController,
  todayRevenueController,
  topCustomersController,
  monthlyExpenseController,
  yearlyExpenseController,
  todayExpenseController,
  topVendorsController,
};
