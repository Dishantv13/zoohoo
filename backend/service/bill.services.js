import { Bill } from "../model/bill.model.js";
import { Vendor } from "../model/vendor.model.js";
import { Item } from "../model/item.model.js";
import { Counter } from "../model/counter.model.js";
import mongoose from "mongoose";
import { BILL_ERRORS } from "../util/errorMessage.js";

const createBillService = async (billData, companyId) => {
  const { vendorId, items, billDate, dueDate } = billData;

  if (!vendorId || !items || items.length === 0 || !dueDate) {
    throw BILL_ERRORS.REQUIRED_FIELDS();
  }

  const vendor = await Vendor.findOne({ _id: vendorId, companyId });
  if (!vendor) {
    throw BILL_ERRORS.VENDOR_NOT_FOUND();
  }

  if (new Date(dueDate) < new Date(billDate)) {
    throw BILL_ERRORS.INVALID_DUE_DATE();
  }

  let totalAmount = 0;
  const validatedItems = [];

  for (const item of items) {
    const { itemId, quantity, rate } = item;

    if (!itemId || !quantity || !rate) {
      throw BILL_ERRORS.INVALID_ITEM_DATA();
    }

    const itemExists = await Item.findOne({
      _id: itemId,
      companyId,
      vendorId,
      isActive: true,
    });

    if (!itemExists) {
      throw BILL_ERRORS.ITEM_NOT_FOUND(itemId);
    }

    if (Number(itemExists.quantity) < Number(quantity)) {
      throw BILL_ERRORS.INSUFFICIENT_STOCK(
        itemExists.name,
        itemExists.quantity,
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
    throw BILL_ERRORS.BILL_NOT_FOUND();
  }

  return bill;
};

const updateBillService = async (billId, billData, companyId) => {
  const bill = await Bill.findOne({ _id: billId, companyId });

  if (!bill) {
    throw BILL_ERRORS.BILL_NOT_FOUND();
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
        throw BILL_ERRORS.INVALID_ITEM_DATA();
      }

      const itemExists = await Item.findOne({
        _id: itemId,
        companyId,
        vendorId: bill.vendorId,
        isActive: true,
      });

      if (!itemExists) {
        throw BILL_ERRORS.ITEM_NOT_FOUND(itemId);
      }

      if (Number(itemExists.quantity) < Number(quantity)) {
        throw BILL_ERRORS.INSUFFICIENT_STOCK(
          itemExists.name,
          itemExists.quantity,
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
      throw BILL_ERRORS.INVALID_STATUS();
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
    throw BILL_ERRORS.BILL_NOT_FOUND();
  }

  await Bill.findByIdAndDelete(billId);
  return { message: "Bill deleted successfully" };
};

const updateBillStatusService = async (billId, status, companyId) => {
  const bill = await Bill.findOne({ _id: billId, companyId });

  if (!bill) {
    throw BILL_ERRORS.BILL_NOT_FOUND();
  }

  if (!["PENDING", "PAID", "PARTIALLY_PAID"].includes(status)) {
    throw BILL_ERRORS.INVALID_STATUS();
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
        pendingBill: {
          $sum: {
            $cond: [{ $ne: ["$status", "PAID"] }, 1, 0],
          },
        },
        overdueCount: {
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
      pendingBill: 0,
      overdueCount: 0,
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
