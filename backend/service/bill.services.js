import { Bill } from "../model/bill.model.js";
import { Vendor } from "../model/vendor.model.js";
import { Item } from "../model/item.model.js";
import { Counter } from "../model/counter.model.js";
import ApiError from "../util/apiError.js";
import mongoose from "mongoose";

const createBillService = async (billData, companyId) => {
  const { vendorId, items, billDate, dueDate } = billData;

  if (!vendorId || !items || items.length === 0 || !dueDate) {
    throw new ApiError(400, "Vendor ID, items, and due date are required");
  }

  const vendor = await Vendor.findOne({ _id: vendorId, companyId });
  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  if (new Date(dueDate) < new Date(billDate)) {
    throw new ApiError(400, "Due date cannot be in the past");
  }

  let totalAmount = 0;
  const validatedItems = [];

  for (const item of items) {
    const { itemId, quantity, rate } = item;

    if (!itemId || !quantity || !rate) {
      throw new ApiError(400, "Each item must have itemId, quantity, and rate");
    }

    const itemExists = await Item.findOne({
      _id: itemId,
      companyId,
      vendorId,
      isActive: true,
    });

    if (!itemExists) {
      throw new ApiError(
        404,
        `Item with ID ${itemId} not found for this vendor`,
      );
    }

    if (Number(itemExists.quantity) < Number(quantity)) {
      throw new ApiError(
        400,
        `Insufficient stock for ${itemExists.name}. Available: ${itemExists.quantity}`,
      );
    }

    const itemTotal = Number(quantity) * Number(rate);
    totalAmount += itemTotal;

    validatedItems.push({
      itemId,
      quantity: Number(quantity),
      rate: Number(rate),
    });
  }

  for (const billItem of validatedItems) {
    const inventoryItem = await Item.findById(billItem.itemId);
    inventoryItem.quantity =
      Number(inventoryItem.quantity) - Number(billItem.quantity);
    await inventoryItem.save();
  }

  const counter = await Counter.findOneAndUpdate(
    { name: "bill" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  const bill = await Bill.create({
    billNumber: `BILL-${counter.seq}`,
    vendorId,
    companyId,
    billDate,
    dueDate,
    items: validatedItems,
    totalAmount,
    amountPaid: 0,
    remainingAmount: totalAmount,
    status: "PENDING",
  });

  const populatedBill = await Bill.findById(bill._id)
    .populate("vendorId", "name email phone")
    .populate("items.itemId", "name quantity");

  return populatedBill;
};

const getBillsService = async (companyId, filters = {}) => {
  const page = Math.max(parseInt(filters.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(filters.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const query = { companyId };

  if (
    filters.vendorId &&
    mongoose.Types.ObjectId.isValid(filters.vendorId) &&
    filters.vendorId !== "null"
  ) {
    query.vendorId = new mongoose.Types.ObjectId(filters.vendorId);
  }
  if (filters.status) {
    query.status = filters.status;
  }

  const totalItems = await Bill.countDocuments(query);

  const totalPages = Math.ceil(totalItems / limit);

  const bills = await Bill.aggregate([
    { $match: query },
    { $addFields: { isPaid: { $cond: [{ $eq: ["$status", "PAID"] }, 1, 0] } } },
    { $sort: { isPaid: 1, dueDate: 1, createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        paymentHistory: 0,
      },
    },
  ]);

  const populatedBills = await Bill.populate(bills, [
    { path: "vendorId", select: "name email phone" },
    { path: "items.itemId", select: "name" },
  ]);

  return {
    bills: populatedBills,
    pagination: {
      page,
      limit,
      totalPages,
      totalItems,
      hasNext: totalPages > 0 && page < totalPages,
      hasPrev: page > 1 && totalPages > 0,
    },
  };
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

  const { items, status, dueDate, billDate } = billData;

  if (items && items.length > 0) {
    for (const oldItem of bill.items) {
      const inventoryItem = await Item.findById(oldItem.itemId);
      if (inventoryItem) {
        inventoryItem.quantity =
          Number(inventoryItem.quantity) + Number(oldItem.quantity || 0);
        await inventoryItem.save();
      }
    }

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const { itemId, quantity, rate } = item;

      if (!itemId || !quantity || !rate) {
        throw new ApiError(
          400,
          "Each item must have itemId, quantity, and rate",
        );
      }

      const itemExists = await Item.findOne({
        _id: itemId,
        companyId,
        vendorId: bill.vendorId,
        isActive: true,
      });

      if (!itemExists) {
        throw new ApiError(
          404,
          `Item with ID ${itemId} not found for this vendor`,
        );
      }

      if (Number(itemExists.quantity) < Number(quantity)) {
        throw new ApiError(
          400,
          `Insufficient stock for ${itemExists.name}. Available: ${itemExists.quantity}`,
        );
      }

      const itemTotal = Number(quantity) * Number(rate);
      totalAmount += itemTotal;

      validatedItems.push({
        itemId,
        quantity: Number(quantity),
        rate: Number(rate),
      });
    }

    for (const billItem of validatedItems) {
      const inventoryItem = await Item.findById(billItem.itemId);
      inventoryItem.quantity =
        Number(inventoryItem.quantity) - Number(billItem.quantity);
      await inventoryItem.save();
    }

    bill.items = validatedItems;
    bill.totalAmount = totalAmount;
    bill.remainingAmount = totalAmount - bill.amountPaid;
  }

  if (status) {
    if (!["PENDING", "PAID", "PARTIALLY_PAID"].includes(status)) {
      throw new ApiError(400, "Invalid status value");
    }
    bill.status = status;
  }

  if (dueDate) {
    bill.dueDate = dueDate;
  }

  if (billDate) {
    bill.billDate = billDate;
  }

  await bill.save();

  const updatedBill = await Bill.findById(bill._id)
    .populate("vendorId", "name email phone")
    .populate("items.itemId", "name quantity");

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

  const statistics = await Bill.aggregate([
    { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
    {
      $group: {
        _id: companyId,
        totalAmount: { $sum: "$totalAmount" },
        paidAmount: { $sum: "$amountPaid" },
        pendingAmount: { $sum: "$remainingAmount" },
        overDueCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lt: ["$dueDate", new Date()] },
                  { $ne: ["$status", "PAID"] },
                ],
              },
              1,
              0,
            ],
          },
        },
        billCount: { $sum: 1 },
      },
    },
  ]);

  return {
    statistics: statistics[0] || {
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      overDueCount: 0,
      billCount: 0,
    },
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
