import { Invoice } from "../model/invoice.model.js";
import { Company } from "../model/company.model.js";

import ApiError from "../util/apiError.js";

const dashboardServices = async (adminId, option = {}) => {
  const company = await Company.findOne({ adminId: adminId });

  if (!company) {
    throw new ApiError(404, "Company not found for the admin");
  }

  const invoiceMatchFilter = { companyId: company._id };
  const { startDate, endDate } = option;

  let paymentDateMatch = null;
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    paymentDateMatch = {
      "paymentHistory.paidAt": {
        $gte: start,
        $lte: end,
      },
    };
  }

  const revenueBasePipeline = [
    { $match: invoiceMatchFilter },
    { $unwind: "$paymentHistory" },
  ];

  if (paymentDateMatch) {
    revenueBasePipeline.push({ $match: paymentDateMatch });
  }

  const totalRevenue = await Invoice.aggregate([
    ...revenueBasePipeline,
    { $group: { _id: null, totalRevenue: { $sum: "$paymentHistory.amount" } } },
  ]);

  const pendingInvoices = await Invoice.countDocuments({
    companyId: company._id,
    status: { $in: ["PENDING", "PARTIALLY_PAID"] },
  });

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const todayRevenue = await Invoice.aggregate([
    { $match: invoiceMatchFilter },
    { $unwind: "$paymentHistory" },
    {
      $match: {
        "paymentHistory.paidAt": {
          $gte: startOfToday,
          $lte: endOfToday,
        },
      },
    },
    { $group: { _id: null, totalRevenue: { $sum: "$paymentHistory.amount" } } },
  ]);

  const todayRevenueChartRaw = await Invoice.aggregate([
    { $match: invoiceMatchFilter },
    { $unwind: "$paymentHistory" },
    {
      $match: {
        "paymentHistory.paidAt": {
          $gte: startOfToday,
          $lte: endOfToday,
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

  const fullDayRevenue = Array.from({ length: 24 }, (_, hour) => {
    const found = todayRevenueChartRaw.find((item) => item._id.hour === hour);

    return {
      hour,
      totalRevenue: found ? found.totalRevenue : 0,
    };
  });

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
    { $limit: 6 },
  ]);

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

  const topCustomers = await Invoice.aggregate([
    { $match: { ...invoiceMatchFilter } },
    { $group: { _id: "$customer", totalSpent: { $sum: "$amountPaid" } } },
    { $sort: { totalSpent: -1 } },
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
        totalSpent: 1,
        customer: "$customerInfo.name",
        email: "$customerInfo.email",
      },
    },
  ]);

  return {
    totalRevenue: totalRevenue[0]?.totalRevenue || 0,
    pendingInvoices: pendingInvoices,
    todayRevenue: todayRevenue[0]?.totalRevenue || 0,
    todayRevenueChart: fullDayRevenue,
    monthlyRevenue: monthlyRevenue.map((item) => ({
      month: item._id.month,
      year: item._id.year,
      totalRevenue: item.totalRevenue,
    })),
    yearlyRevenue: yearlyRevenue.map((item) => ({
      year: item._id.year,
      totalRevenue: item.totalRevenue,
    })),
    topCustomers: topCustomers,
  };
};

export { dashboardServices };
