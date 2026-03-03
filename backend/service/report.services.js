import { Invoice } from "../model/invoice.model.js";
import { Company } from "../model/company.model.js";

import ApiError from "../util/apiError.js";

const getCompanyByAdmin = async (adminId) => {
  const company = await Company.findOne({ adminId });

  if (!company) {
    throw new ApiError(404, "Company not found for the admin");
  }

  return company;
};

const normalizeDate = (dateValue) => {
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getDateRangeFilter = ({ startDate, endDate, month, year }) => {
  if (month !== undefined && month !== null && month !== "") {
    const monthNumber = Number(month);
    const yearNumber = year ? Number(year) : new Date().getFullYear();

    if (
      !Number.isInteger(monthNumber) ||
      monthNumber < 1 ||
      monthNumber > 12 ||
      !Number.isInteger(yearNumber)
    ) {
      throw new ApiError(400, "Invalid month or year value");
    }

    const rangeStart = new Date(yearNumber, monthNumber - 1, 1, 0, 0, 0, 0);
    const rangeEnd = new Date(yearNumber, monthNumber, 0, 23, 59, 59, 999);

    return { $gte: rangeStart, $lte: rangeEnd };
  }

  if (startDate && endDate) {
    const rangeStart = normalizeDate(startDate);
    const rangeEnd = normalizeDate(endDate);

    if (!rangeStart || !rangeEnd) {
      throw new ApiError(400, "Invalid startDate or endDate");
    }

    rangeStart.setHours(0, 0, 0, 0);
    rangeEnd.setHours(23, 59, 59, 999);

    return { $gte: rangeStart, $lte: rangeEnd };
  }

  return null;
};

const dashboardServices = async (adminId, option = {}) => {
  const company = await getCompanyByAdmin(adminId);
  const invoiceMatchFilter = { companyId: company._id };
  const paymentDateRange = getDateRangeFilter(option);

  const revenuePipeline = [
    { $match: invoiceMatchFilter },
    { $unwind: "$paymentHistory" },
  ];

  if (paymentDateRange) {
    revenuePipeline.push({
      $match: { "paymentHistory.paidAt": paymentDateRange },
    });
  }

  const totalRevenueResult = await Invoice.aggregate([
    ...revenuePipeline,
    { $group: { _id: null, totalRevenue: { $sum: "$paymentHistory.amount" } } },
  ]);

  const pendingInvoices = await Invoice.countDocuments({
    companyId: company._id,
    status: { $in: ["PENDING", "PARTIALLY_PAID"] },
  });

  const todayRevenueData = await todayRevenueServices(adminId, {});
  const monthlyRevenueData = await monthlyRevenueServices(adminId, option);
  const yearlyRevenueData = await yearlyRevenueServices(adminId, option);
  const topCustomersData = await topCustomersServices(adminId, option);

  return {
    totalRevenue: totalRevenueResult[0]?.totalRevenue || 0,
    pendingInvoices,
    todayRevenue: todayRevenueData.totalRevenue || 0,
    todayRevenueChart: todayRevenueData.hourlyRevenue || [],
    monthlyRevenue: monthlyRevenueData,
    yearlyRevenue: yearlyRevenueData,
    topCustomers: topCustomersData,
  };
};

const monthlyRevenueServices = async (adminId, option = {}) => {
  const company = await getCompanyByAdmin(adminId);
  const invoiceMatchFilter = { companyId: company._id };
  const paymentDateRange = getDateRangeFilter(option);

  const revenueBasePipeline = [
    { $match: invoiceMatchFilter },
    { $unwind: "$paymentHistory" },
  ];

  if (paymentDateRange) {
    revenueBasePipeline.push({
      $match: { "paymentHistory.paidAt": paymentDateRange },
    });
  }

  const monthlyRevenue = await Invoice.aggregate([
    ...revenueBasePipeline,
    {
      $group: {
        _id: {
          month: { $month: "$paymentHistory.paidAt" },
          year: { $year: "$paymentHistory.paidAt" },
        },
        totalRevenue: { $sum: "$paymentHistory.amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    { $limit: 5 },
  ]);

  return monthlyRevenue.map((item) => ({
    month: item._id.month,
    year: item._id.year,
    totalRevenue: item.totalRevenue,
  }));
};

const yearlyRevenueServices = async (adminId, option = {}) => {
  const company = await getCompanyByAdmin(adminId);
  const invoiceMatchFilter = { companyId: company._id };
  const paymentDateRange = getDateRangeFilter(option);

  const revenueBasePipeline = [
    { $match: invoiceMatchFilter },
    { $unwind: "$paymentHistory" },
  ];

  if (paymentDateRange) {
    revenueBasePipeline.push({
      $match: { "paymentHistory.paidAt": paymentDateRange },
    });
  }

  if (option.year) {
    const yearNumber = Number(option.year);
    if (!Number.isInteger(yearNumber)) {
      throw new ApiError(400, "Invalid year value");
    }

    const yearStart = new Date(yearNumber, 0, 1, 0, 0, 0, 0);
    const yearEnd = new Date(yearNumber, 11, 31, 23, 59, 59, 999);

    revenueBasePipeline.push({
      $match: {
        "paymentHistory.paidAt": {
          $gte: yearStart,
          $lte: yearEnd,
        },
      },
    });
  }

  const yearlyRevenue = await Invoice.aggregate([
    ...revenueBasePipeline,
    {
      $group: {
        _id: {
          year: { $year: "$paymentHistory.paidAt" },
        },
        totalRevenue: { $sum: "$paymentHistory.amount" },
      },
    },
    { $sort: { "_id.year": 1 } },
    { $limit: 5 },
  ]);

  return yearlyRevenue.map((item) => ({
    year: item._id.year,
    totalRevenue: item.totalRevenue,
  }));
};

const todayRevenueServices = async (adminId, option = {}) => {
  const company = await getCompanyByAdmin(adminId);
  const invoiceMatchFilter = { companyId: company._id };

  const selectedDate = normalizeDate(
    option.date || option.endDate || option.startDate || new Date(),
  );
  if (!selectedDate) {
    throw new ApiError(400, "Invalid date value");
  }

  const selectedDateStart = new Date(selectedDate);
  selectedDateStart.setHours(0, 0, 0, 0);

  const selectedDateEnd = new Date(selectedDate);
  selectedDateEnd.setHours(23, 59, 59, 999);

  const chartData = await Invoice.aggregate([
    { $match: invoiceMatchFilter },
    { $unwind: "$paymentHistory" },
    {
      $match: {
        "paymentHistory.paidAt": {
          $gte: selectedDateStart,
          $lte: selectedDateEnd,
        },
      },
    },
    {
      $group: {
        _id: {
          hour: {
            $hour: {
              date: "$paymentHistory.paidAt",
              timezone: "Asia/Kolkata",
            },
          },
        },
        totalRevenue: { $sum: "$paymentHistory.amount" },
      },
    },
    { $sort: { "_id.hour": 1 } },
  ]);

  const revenueMap = new Map(
    chartData.map((item) => [item._id.hour, item.totalRevenue]),
  );

  const hourlyRevenue = Array.from({ length: 24 }, (_, index) => {
    const hourInDb = index;
    return {
      hour: index + 1,
      totalRevenue: revenueMap.get(hourInDb) || 0,
    };
  });

  const selectedDateLabel = selectedDateStart.toISOString().split("T")[0];
  const totalRevenue = hourlyRevenue.reduce(
    (sum, item) => sum + item.totalRevenue,
    0,
  );

  return {
    selectedDate: selectedDateLabel,
    totalRevenue,
    hourlyRevenue,
  };
};

const topCustomersServices = async (adminId, option = {}) => {
  const company = await getCompanyByAdmin(adminId);

  const invoiceMatchFilter = { companyId: company._id };
  const paymentDateRange = getDateRangeFilter(option);

  const revenueBasePipeline = [
    { $match: invoiceMatchFilter },
    { $unwind: "$paymentHistory" },
  ];

  if (paymentDateRange) {
    revenueBasePipeline.push({
      $match: {
        "paymentHistory.paidAt": paymentDateRange,
      },
    });
  }

  const topCustomers = await Invoice.aggregate([
    ...revenueBasePipeline,
    {
      $group: {
        _id: "$customer",
        totalAmount: { $sum: "$paymentHistory.amount" },
      },
    },
    { $match: { _id: { $ne: null } } },
    { $sort: { totalAmount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "customerInfo",
      },
    },
    { $unwind: "$customerInfo" },
    {
      $project: {
        totalAmount: 1,
        customer: "$customerInfo.name",
        email: "$customerInfo.email",
      },
    },
  ]);
  return topCustomers;
};

export {
  dashboardServices,
  monthlyRevenueServices,
  yearlyRevenueServices,
  todayRevenueServices,
  topCustomersServices,
};
