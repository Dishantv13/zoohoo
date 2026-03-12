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

const dashboardController = asyncHandler(async (req, res) => {
  const { startDate, endDate, month, year, date } = req.query;
  const data = await dashboardServices(req.user._id, {
    startDate,
    endDate,
    month,
    year,
    date,
  });
  successResponse(res, data, 200, "Dashboard data retrieved successfully");
});

const monthlyRevenueController = asyncHandler(async (req, res) => {
  const { startDate, endDate, month, year } = req.query;
  const data = await monthlyRevenueServices(req.user._id, {
    startDate,
    endDate,
    month,
    year,
  });

  successResponse(
    res,
    data,
    200,
    "Monthly revenue data retrieved successfully",
  );
});

const yearlyRevenueController = asyncHandler(async (req, res) => {
  const { startDate, endDate, year } = req.query;
  const data = await yearlyRevenueServices(req.user._id, {
    startDate,
    endDate,
    year,
  });

  successResponse(res, data, 200, "Yearly revenue data retrieved successfully");
});

const todayRevenueController = asyncHandler(async (req, res) => {
  const { date, startDate, endDate } = req.query;
  const data = await todayRevenueServices(req.user._id, {
    date,
    startDate,
    endDate,
  });

  successResponse(
    res,
    data,
    200,
    "Today's revenue data retrieved successfully",
  );
});

const topCustomersController = asyncHandler(async (req, res) => {
  const { startDate, endDate, month, year } = req.query;
  const data = await topCustomersServices(req.user._id, {
    startDate,
    endDate,
    month,
    year,
  });

  successResponse(res, data, 200, "Top customers data retrieved successfully");
});

const monthlyExpenseController = asyncHandler(async (req, res) => {
  const { startDate, endDate, month, year } = req.query;
  const data = await monthlyExpenseServices(req.user._id, {
    startDate,
    endDate,
    month,
    year,
  });
  successResponse(
    res,
    data,
    200,
    "Monthly expense data retrieved successfully",
  );
});

const yearlyExpenseController = asyncHandler(async (req, res) => {
  const { startDate, endDate, year } = req.query;
  const data = await yearlyExpenseServices(req.user._id, {
    startDate,
    endDate,
    year,
  });
  successResponse(res, data, 200, "Yearly expense data retrieved successfully");
});

const todayExpenseController = asyncHandler(async (req, res) => {
  const { date, startDate, endDate } = req.query;
  const data = await todayExpenseServices(req.user._id, {
    date,
    startDate,
    endDate,
  });
  successResponse(
    res,
    data,
    200,
    "Today's expense data retrieved successfully",
  );
});

const topVendorsController = asyncHandler(async (req, res) => {
  const { startDate, endDate, month, year } = req.query;
  const data = await topVendorsServices(req.user._id, {
    startDate,
    endDate,
    month,
    year,
  });
  successResponse(res, data, 200, "Top vendors data retrieved successfully");
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
