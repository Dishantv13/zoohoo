import { Bill } from "../model/bill.model.js";
import { Vendor } from "../model/vendor.model.js";
import { Item } from "../model/item.model.js";
import ApiError from "../util/apiError.js";

const createBillService = async (billData, companyId) => {
  const { vendorId, items } = billData;

  if (!vendorId || !items || items.length === 0) {
    throw new ApiError(400, "Vendor ID and items are required");
  }

  const vendor = await Vendor.findOne({ _id: vendorId, companyId });
  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  let totalAmount = 0;
  const validatedItems = [];

  for (const item of items) {
    const { itemId, quantity, rate } = item;

    if (!itemId || !quantity || !rate) {
      throw new ApiError(400, "Each item must have itemId, quantity, and rate");
    }

    const itemExists = await Item.findById(itemId);
    if (!itemExists) {
      throw new ApiError(404, `Item with ID ${itemId} not found`);
    }

    const itemTotal = quantity * rate;
    totalAmount += itemTotal;

    validatedItems.push({
      itemId,
      quantity,
      rate,
    });
  }

  const bill = await Bill.create({
    vendorId,
    companyId,
    items: validatedItems,
    totalAmount,
    status: "PENDING",
  });

  const populatedBill = await Bill.findById(bill._id)
    .populate("vendorId", "name email phone")
    .populate("items.itemId", "name");

  return populatedBill;
};

const getBillsService = async (companyId, filters = {}) => {
  const query = { companyId };

  if (filters.vendorId) {
    query.vendorId = filters.vendorId;
  }
  if (filters.status) {
    query.status = filters.status;
  }

  const bills = await Bill.find(query)
    .populate("vendorId", "name email phone")
    .populate("items.itemId", "name")
    .sort({ createdAt: -1 });

  return bills;
};

const getBillByIdService = async (billId, companyId) => {
  const bill = await Bill.findOne({ _id: billId, companyId })
    .populate("vendorId", "name email phone address")
    .populate("items.itemId", "name");

  if (!bill) {
    throw new ApiError(404, "Bill not found");
  }

  return bill;
};

const updateBillService = async (billId, billData, companyId) => {
  const bill = await Bill.findOne({ _id: billId, companyId });

  if (!bill) {
    throw new ApiError(404, "Bill not found");
  }

  const { items, status } = billData;

  if (items && items.length > 0) {
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const { itemId, quantity, rate } = item;

      if (!itemId || !quantity || !rate) {
        throw new ApiError(400, "Each item must have itemId, quantity, and rate");
      }

      const itemExists = await Item.findById(itemId);
      if (!itemExists) {
        throw new ApiError(404, `Item with ID ${itemId} not found`);
      }

      const itemTotal = quantity * rate;
      totalAmount += itemTotal;

      validatedItems.push({
        itemId,
        quantity,
        rate,
      });
    }

    bill.items = validatedItems;
    bill.totalAmount = totalAmount;
  }

  if (status) {
    if (!["PENDING", "PAID", "PARTIALLY_PAID"].includes(status)) {
      throw new ApiError(400, "Invalid status value");
    }
    bill.status = status;
  }

  await bill.save();

  const updatedBill = await Bill.findById(bill._id)
    .populate("vendorId", "name email phone")
    .populate("items.itemId", "name");

  return updatedBill;
};

const deleteBillService = async (billId, companyId) => {
  const bill = await Bill.findOne({ _id: billId, companyId });

  if (!bill) {
    throw new ApiError(404, "Bill not found");
  }

  await Bill.findByIdAndDelete(billId);
  return { message: "Bill deleted successfully" };
};

const updateBillStatusService = async (billId, status, companyId) => {
  const bill = await Bill.findOne({ _id: billId, companyId });

  if (!bill) {
    throw new ApiError(404, "Bill not found");
  }

  if (!["PENDING", "PAID", "PARTIALLY_PAID"].includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  bill.status = status;
  await bill.save();

  const updatedBill = await Bill.findById(bill._id)
    .populate("vendorId", "name email phone")
    .populate("items.itemId", "name");

  return updatedBill;
};

const getBillsStatsService = async (companyId) => {
  const bills = await Bill.find({ companyId });

  const totalBills = bills.length;
  const totalAmount = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const paidAmount = bills
    .filter((bill) => bill.status === "PAID")
    .reduce((sum, bill) => sum + bill.totalAmount, 0);
  const pendingAmount = bills
    .filter((bill) => bill.status === "PENDING")
    .reduce((sum, bill) => sum + bill.totalAmount, 0);
  const partiallyPaidAmount = bills
    .filter((bill) => bill.status === "PARTIALLY_PAID")
    .reduce((sum, bill) => sum + bill.totalAmount, 0);

  return {
    totalBills,
    totalAmount,
    paidAmount,
    pendingAmount,
    partiallyPaidAmount,
    outstandingAmount: pendingAmount + partiallyPaidAmount,
  };
};

export {
  createBillService,
  getBillsService,
  getBillByIdService,
  updateBillService,
  deleteBillService,
  updateBillStatusService,
  getBillsStatsService,
};
