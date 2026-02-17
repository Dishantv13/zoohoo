import mongoose, { mongo } from "mongoose";
import { Invoice } from "../model/invoice.model.js";

const createInvoiceService = async (userId, data) => {
  const {
    customer,
    items = [],
    invoiceDate,
    dueDate,
    status = "PENDING",
    discount = 0,
    tax = 18,
  } = data;

  if (!items.length) {
    throw new Error("Invoice must have at least one item");
  }

  const parsedTaxRate = Number(tax);
  const parsedDiscount = Number(discount);

  const subtotal = items.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    return sum + quantity * rate;
  }, 0);

  const discountAmount = subtotal * (parsedDiscount / 100);

  const amountAfterDiscount = subtotal - discountAmount;

  const taxAmount = amountAfterDiscount * (parsedTaxRate / 100);

  const totalAmount = subtotal + taxAmount - discountAmount;

  const finalSubtotal = Number(subtotal.toFixed(2));
  const finalTax = Number(taxAmount.toFixed(2));
  const finalTotal = Number(totalAmount.toFixed(2));

  const invoiceCount = await Invoice.countDocuments();

  const invoice = await Invoice.create({
    invoiceNumber: `INV-${invoiceCount + 1}`,
    createdBy: userId,
    customer,
    invoiceDate,
    dueDate,
    status,
    items,
    subtotal: finalSubtotal,
    parseTaxRate: parsedTaxRate,
    tax: finalTax,
    parseDiscount: parsedDiscount,
    discount: discountAmount,
    amountAfterDiscount: amountAfterDiscount,
    totalAmount: finalTotal,
  });
  return invoice;
};

const getInvoicesServices = async (userId, options = {}) => {
  const page = Math.max(parseInt(options.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(options.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const match = { createdBy: userId };

  const totalItems = await Invoice.countDocuments(match);

  const invoices = await Invoice.aggregate([
    { $match: match },
    { $addFields: { isPaid: { $cond: [{ $eq: ["$status", "PAID"] }, 1, 0] } } },
    { $sort: { isPaid: 1, dueDate: 1, createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ]);

  const summary = await Invoice.aggregate([
  { $match: match },
  {
    $group: {
      _id: null,
      totalAmount: { $sum: "$totalAmount" },
      paidAmount: {
        $sum: {
          $cond: [{ $eq: ["$status", "PAID"] }, "$totalAmount", 0],
        },
      },
      pendingAmount: {
        $sum: {
          $cond: [{ $eq: ["$status", "PENDING"] }, "$totalAmount", 0],
        },
      },
      confirmedAmount: {
        $sum: {
          $cond: [{ $eq: ["$status", "CONFIRMED"] }, "$totalAmount", 0],
        },
      },
      overdueCount: {
        $sum: {
          $cond: [
            {
              $and: [
                { $lt: ["$dueDate", new Date()] },
                { $ne: ["$status", "PAID"] },
                { $ne: ["$status", "CANCELLED"] },
                // { $nin: ["$status", ["PAID", "CANCELLED"]] },
              ],
            },
            1,
            0,
          ],
        },
      },
    },
  },
]);

  const populated = await Invoice.populate(invoices, {
    path: "customer",
    select: "name email",
  });

  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

  // console.log("Pagination Info:", {
  //   page,
  //   limit,
  //   totalItems,
  //   totalPages,
  //   hasNext: totalPages > 0 && page < totalPages,
  //   hasPrev: page > 1 && totalPages > 0,
  // });

  return {
    data: populated,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNext: totalPages > 0 && page < totalPages,
      hasPrev: page > 1 && totalPages > 0,
    },
    summary: summary[0] || {
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    confirmedAmount: 0,
    overdueCount: 0,
}

  };
};

const getInvoiceByIdService = async (userId, invoiceId) => {
  const invoice = await Invoice.findById(invoiceId).populate("customer");

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (invoice.createdBy.toString() !== userId.toString()) {
    throw new Error("Not authorized to access this invoice");
  }

  return invoice;
};

const updateInvoiceService = async (userId, invoiceId, data) => {
  const {
    customer,
    items = [],
    invoiceDate,
    dueDate,
    status = "PENDING",
    discount = 0,
    tax = 18,
  } = data;

  if (!items.length) {
    throw new Error("Invoice must have at least one item");
  }

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (invoice.createdBy.toString() !== userId.toString()) {
    throw new Error("Not authorized to update this invoice");
  }

  if (invoice.status === "PAID" && status !== "PAID") {
    throw new Error("Paid invoice cannot be updated");
  }

  const parsedTaxRate = Number(tax);
  const parsedDiscount = Number(discount);

  const subtotal = items.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    return sum + quantity * rate;
  }, 0);

  const discountAmount = subtotal * (parsedDiscount / 100);
  // console.log("Subtotal:", subtotal, "Discount Amount:", discountAmount);

  const amountAfterDiscount = subtotal - discountAmount;
  // console.log("Amount after discount:", amountAfterDiscount);

  const taxAmount = amountAfterDiscount * (parsedTaxRate / 100);
  // console.log("Tax Amount:", taxAmount);

  const totalAmount = subtotal + taxAmount - discountAmount;
  // console.log("Total Amount:", totalAmount);

  const finalSubtotal = Number(subtotal.toFixed(2));
  const finalTax = Number(taxAmount.toFixed(2));
  const finalTotal = Number(totalAmount.toFixed(2));

  invoice.customer = customer;
  invoice.invoiceDate = invoiceDate;
  invoice.dueDate = dueDate;
  invoice.status = status || invoice.status;
  invoice.items = items;
  invoice.subtotal = finalSubtotal;
  invoice.parseTaxRate = parsedTaxRate;
  invoice.tax = finalTax;
  invoice.parseDiscount = parsedDiscount;
  invoice.amountAfterDiscount = amountAfterDiscount;
  invoice.discount = discountAmount;
  invoice.totalAmount = finalTotal;

  await invoice.save();

  return invoice;
};

const updateInvoiceStatusService = async (userId, invoiceId, newStatus) => {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (invoice.createdBy.toString() !== userId.toString()) {
    throw new Error("Not authorized to update invoice status");
  }

  invoice.status = newStatus;
  await invoice.save();

  return invoice;
};

const deleteInvoiceService = async (userId, invoiceId) => {
  const invoice = await Invoice.findById(invoiceId);

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (invoice.createdBy.toString() !== userId.toString()) {
    throw new Error("Not authorized to delete this invoice");
  }

  if (invoice.status === "PAID") {
    throw new Error("Paid invoice cannot be deleted");
  }

  await Invoice.findByIdAndDelete(invoiceId);
};

export {
  createInvoiceService,
  getInvoicesServices,
  getInvoiceByIdService,
  updateInvoiceService,
  updateInvoiceStatusService,
  deleteInvoiceService,
};
