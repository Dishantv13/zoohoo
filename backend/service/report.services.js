import { Invoice } from "../model/invoice.model.js";
import { Bill } from "../model/bill.model.js";
import { Company } from "../model/company.model.js";
import { REPORT_ERROR } from "../util/errorMessage.js";

const getCompanyByAdmin = async (adminId) => {
  const company = await Company.findOne({ adminId });

  if (!company) {
    throw REPORT_ERROR.COMPANY_NOT_FOUND();
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
      throw REPORT_ERROR.INVALID_MONTH_OR_YEAR();
    }

    const rangeStart = new Date(yearNumber, monthNumber - 1, 1, 0, 0, 0, 0);
    const rangeEnd = new Date(yearNumber, monthNumber, 0, 23, 59, 59, 999);

    return { $gte: rangeStart, $lte: rangeEnd };
  }

  if (startDate && endDate) {
    const rangeStart = normalizeDate(startDate);
    const rangeEnd = normalizeDate(endDate);

    if (!rangeStart || !rangeEnd) {
      throw REPORT_ERROR.INVALID_DATE_RANGE();
    }

    rangeStart.setHours(0, 0, 0, 0);
    rangeEnd.setHours(23, 59, 59, 999);

    return { $gte: rangeStart, $lte: rangeEnd };
  }

  return null;
};

const dashboardServices = async (adminId, option = {}) => {
  const company = await getCompanyByAdmin(adminId);
  const matchFilter = { companyId: company._id };
  const paymentDateRange = getDateRangeFilter(option);

  const pipeLine = [{ $match: matchFilter }, { $unwind: "$paymentHistory" }];

  if (paymentDateRange) {
    pipeLine.push({
      $match: { "paymentHistory.paidAt": paymentDateRange },
    });
  }

  const totalRevenueResult = await Invoice.aggregate([
    ...pipeLine,
    { $group: { _id: null, totalRevenue: { $sum: "$paymentHistory.amount" } } },
  ]);

  const totalExpenseResult = await Bill.aggregate([
    ...pipeLine,
    { $group: { _id: null, totalExpense: { $sum: "$paymentHistory.amount" } } },
  ]);

  const pendingInvoices = await Invoice.countDocuments({
    companyId: company._id,
    status: { $in: ["PENDING", "PARTIALLY_PAID"] },
  });

  const pendingBills = await Bill.countDocuments({
    companyId: company._id,
    status: { $in: ["PENDING", "PARTIALLY_PAID"] },
  });

  const totalRevenue =
    Number(Number(totalRevenueResult[0]?.totalRevenue).toFixed(2)) || 0;
  const totalExpense =
    Number(Number(totalExpenseResult[0]?.totalExpense).toFixed(2)) || 0;

  const totalNetProfit = totalRevenue - totalExpense;
  const profit = totalNetProfit >= 0 ? totalNetProfit : 0;
  const loss = totalNetProfit < 0 ? Math.abs(totalNetProfit) : 0;

  const todayRevenueData = await todayRevenueServices(adminId, {});
  const todayExpenseData = await todayExpenseServices(adminId, {});

  const todayRevenue = Number(Number(todayRevenueData.totalRevenue).toFixed(2)) || 0;
  const todayExpense = Number(Number(todayExpenseData.totalExpense).toFixed(2)) || 0;

  const todayNetProfit = todayRevenue - todayExpense;
  const todayProfit = todayNetProfit >= 0 ? todayNetProfit : 0;
  const todayLoss = todayNetProfit < 0 ? Math.abs(todayNetProfit) : 0;

  return {
    totalRevenue: totalRevenue || 0,
    totalExpense: totalExpense || 0,
    totalNetProfit: totalNetProfit,
    profit,
    loss,
    todayRevenue: todayRevenue || 0,
    todayExpense: todayExpense || 0,
    todayProfit,
    todayLoss,
    pendingInvoices: pendingInvoices,
    pendingBills: pendingBills,
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
        throw REPORT_ERROR.INVALID_YEAR();
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
    throw REPORT_ERROR.INVALID_DATE();
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

const monthlyExpenseServices = async (adminId, option = {}) => {
  const company = await getCompanyByAdmin(adminId);
  const billMatchFilter = { companyId: company._id };
  const paymentDateRange = getDateRangeFilter(option);

  const expenseBasePipeline = [
    { $match: billMatchFilter },
    { $unwind: "$paymentHistory" },
  ];

  if (paymentDateRange) {
    expenseBasePipeline.push({
      $match: { "paymentHistory.paidAt": paymentDateRange },
    });
  }

  const monthlyExpense = await Bill.aggregate([
    ...expenseBasePipeline,
    {
      $group: {
        _id: {
          month: { $month: "$paymentHistory.paidAt" },
          year: { $year: "$paymentHistory.paidAt" },
        },
        totalExpense: { $sum: "$paymentHistory.amount" },
      },
    },
    { $sort: { _id: 1, "_id.month": 1 } },
    { $limit: 5 },
  ]);

  return monthlyExpense.map((item) => ({
    month: item._id.month,
    year: item._id.year,
    totalExpense: item.totalExpense,
  }));
};

const yearlyExpenseServices = async (adminId, option = {}) => {
  const company = await getCompanyByAdmin(adminId);
  const billMatchFilter = { companyId: company._id };
  const paymentDateRange = getDateRangeFilter(option);

  const expenseBasePipeline = [
    { $match: billMatchFilter },
    { $unwind: "$paymentHistory" },
  ];

  if (paymentDateRange) {
    expenseBasePipeline.push({
      $match: { "paymentHistory.paidAt": paymentDateRange },
    });
  }

  if (option.year) {
    const yearNumber = Number(option.year);
    if (!Number.isInteger(yearNumber)) {
      throw REPORT_ERROR.INVALID_YEAR();
    }

    const yearStart = new Date(yearNumber, 0, 1, 0, 0, 0, 0);
    const yearEnd = new Date(yearNumber, 11, 31, 23, 59, 59, 999);

    expenseBasePipeline.push({
      $match: {
        "paymentHistory.paidAt": {
          $gte: yearStart,
          $lte: yearEnd,
        },
      },
    });
  }

  const yearlyExpense = await Bill.aggregate([
    ...expenseBasePipeline,
    {
      $group: {
        _id: {
          year: { $year: "$paymentHistory.paidAt" },
        },
        totalExpense: { $sum: "$paymentHistory.amount" },
      },
    },
  ]);

  return yearlyExpense.map((item) => ({
    year: item._id.year,
    totalExpense: item.totalExpense,
  }));
};

const todayExpenseServices = async (adminId, option = {}) => {
  const company = await getCompanyByAdmin(adminId);
  const billMatchFilter = { companyId: company._id };
  const selectedDate = normalizeDate(
    option.date || option.endDate || option.startDate || new Date(),
  );
  if (!selectedDate) {
    throw REPORT_ERROR.INVALID_DATE();
  }

  const selectedDateStart = new Date(selectedDate);
  selectedDateStart.setHours(0, 0, 0, 0);

  const selectedDateEnd = new Date(selectedDate);
  selectedDateEnd.setHours(23, 59, 59, 999);

  const chartData = await Bill.aggregate([
    { $match: billMatchFilter },
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
        totalExpense: { $sum: "$paymentHistory.amount" },
      },
    },
    {
      $sort: { "_id.hour": 1 },
    },
  ]);

  const expenseMap = new Map(
    chartData.map((item) => [item._id.hour, item.totalExpense]),
  );
  const hourlyExpense = Array.from({ length: 24 }, (_, index) => {
    const hourInDb = index;
    return {
      hour: index + 1,
      totalExpense: expenseMap.get(hourInDb) || 0,
    };
  });

  const selectedDateLabel = selectedDateStart.toISOString().split("T")[0];
  const totalExpense = hourlyExpense.reduce(
    (sum, item) => sum + item.totalExpense,
    0,
  );

  return {
    selectedDate: selectedDateLabel,
    totalExpense,
    hourlyExpense,
  };
};

const topVendorsServices = async (adminId, option = {}) => {
  const company = await getCompanyByAdmin(adminId);

  const billMatchFilter = { companyId: company._id };
  const paymentDateRange = getDateRangeFilter(option);

  const expenseBasePipeline = [
    { $match: billMatchFilter },
    { $unwind: "$paymentHistory" },
  ];

  if (paymentDateRange) {
    expenseBasePipeline.push({
      $match: {
        "paymentHistory.paidAt": paymentDateRange,
      },
    });
  }

  const topVendors = await Bill.aggregate([
    ...expenseBasePipeline,
    {
      $group: {
        _id: "$vendorId",
        totalAmount: { $sum: "$paymentHistory.amount" },
      },
    },
    { $match: { _id: { $ne: null } } },
    { $sort: { totalAmount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "vendors",
        localField: "_id",
        foreignField: "_id",
        as: "vendorInfo",
      },
    },
    { $unwind: "$vendorInfo" },
    {
      $project: {
        totalAmount: 1,
        vendor: "$vendorInfo.name",
        email: "$vendorInfo.email",
      },
    },
  ]);
  return topVendors;
};

export {
  dashboardServices,
  monthlyRevenueServices,
  yearlyRevenueServices,
  todayRevenueServices,
  topCustomersServices,
  monthlyExpenseServices,
  yearlyExpenseServices,
  todayExpenseServices,
  topVendorsServices,
};
