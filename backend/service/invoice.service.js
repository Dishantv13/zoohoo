import mongoose from "mongoose";
import { Invoice } from "../model/invoice.model.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

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
  const finalDiscountAmount = Number(discountAmount.toFixed(2));
  const finalAmountAfterDiscount = Number(amountAfterDiscount.toFixed(2));
  const finalTax = Number(taxAmount.toFixed(2));
  const finalTotal = Number(totalAmount.toFixed(2));

  const invoiceCount = await Invoice.countDocuments();

  const invoice = await Invoice.create({
    invoiceNumber: `INV-${invoiceCount + 1}`,
    invoiceCount: invoiceCount + 1,
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
    discount: finalDiscountAmount,
    amountAfterDiscount: finalAmountAfterDiscount,
    totalAmount: finalTotal,
  });
  return invoice;
};

const getInvoicesServices = async (userId, options = {}) => {
  const page = Math.max(parseInt(options.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(options.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const { status } = options;

  const filteredMatch = {
    createdBy: userId,
    ...(status && status !== "null" ? { status } : {}),
  };

  const summaryMatch = { createdBy: userId };

  const totalItems = await Invoice.countDocuments(filteredMatch);

  const invoices = await Invoice.aggregate([
    { $match: filteredMatch },
    { $addFields: { isPaid: { $cond: [{ $eq: ["$status", "PAID"] }, 1, 0] } } },
    { $sort: { isPaid: 1, dueDate: 1, createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ]);

  const summary = await Invoice.aggregate([
    { $match: summaryMatch },
    {
      $group: {
        _id: userId,
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
    },
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

  const amountAfterDiscount = subtotal - discountAmount;

  const taxAmount = amountAfterDiscount * (parsedTaxRate / 100);

  const totalAmount = subtotal + taxAmount - discountAmount;

  const finalSubtotal = Number(subtotal.toFixed(2));
  const finalDiscountAmount = Number(discountAmount.toFixed(2));
  const finalAmountAfterDiscount = Number(amountAfterDiscount.toFixed(2));
  const finalTax = Number(taxAmount.toFixed(2));
  const finalTotal = Number(totalAmount.toFixed(2));

  const updateData = {
    customer,
    invoiceDate,
    dueDate,
    status,
    items,
    subtotal: finalSubtotal,
    parseTaxRate: parsedTaxRate,
    tax: finalTax,
    parseDiscount: parsedDiscount,
    amountAfterDiscount: finalAmountAfterDiscount,
    discount: finalDiscountAmount,
    totalAmount: finalTotal,
  };

  const updatedInvoice = await Invoice.findByIdAndUpdate(
    invoiceId,
    { $set: updateData },
    { new: true },
  );

  return updatedInvoice;
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

const downloadInvoiceService = async (userId, invoiceId, res) => {
  const invoice = await Invoice.findById(invoiceId).populate("customer");

  if (!invoice) throw new Error("Invoice not found");

  if (invoice.createdBy.toString() !== userId.toString()) {
    throw new Error("Not authorized");
  }

  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`,
  );

  doc.pipe(res);

  const logoPath = path.join("public", "pdf.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 45, { width: 60 });
  }

  doc
    .fontSize(20)
    .text("YOUR COMPANY NAME", 120, 50)
    .fontSize(10)
    .text("Your Company Address Line 1", 120, 70)
    .text("City, State, Pincode", 120, 85)
    .text("GSTIN: 22AAAAA0000A1Z5", 120, 100)
    .moveDown();

  doc.moveTo(50, 130).lineTo(550, 130).stroke();

  doc
    .fontSize(12)
    .text(`Invoice No: ${invoice.invoiceNumber}`, 50, 150)
    .text(
      `Invoice Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`,
      350,
      150,
    )
    .text(
      `Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`,
      350,
      170,
    )
    .moveDown();

  doc
    .text("Bill To:", 50, 190)
    .text(invoice.customer.name, 50, 205)
    .text(invoice.customer.email, 50, 220)
    .moveDown();

  doc
    .text("Bill From:", 350, 190)
    .text("Your Company Name", 350, 205)
    .text("Your Company Email", 350, 220)
    .moveDown();

  const tableTop = 260;

  doc
    .font("Helvetica-Bold")
    .text("S.No", 50, tableTop)
    .text("Item", 90, tableTop)
    .text("Qty", 300, tableTop)
    .text("Rate", 350, tableTop)
    .text("Amount", 450, tableTop);

  doc
    .moveTo(50, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .stroke();

  doc.font("Helvetica");

  let position = tableTop + 30;

  invoice.items.forEach((item, index) => {
    doc
      .text(index + 1, 50, position)
      .text(item.name, 90, position)
      .text(item.quantity, 300, position)
      .text(`₹ ${item.rate}`, 350, position)
      .text(`₹ ${item.quantity * item.rate}`, 450, position);

    position += 25;
  });

  doc
    .moveTo(300, position + 10)
    .lineTo(550, position + 10)
    .stroke();

  position += 25;

  doc
    .font("Helvetica-Bold")
    .text(`Subtotal: ₹ ${invoice.subtotal}`, 350, position);

  position += 20;

  doc.text(
    `Discount (${invoice.parseDiscount}%): - ₹ ${invoice.discount}`,
    350,
    position,
  );

  position += 20;

  doc.text(
    `AfterDiscount (${invoice.parseDiscount}%): ₹ ${invoice.amountAfterDiscount}`,
    350,
    position,
  );

  position += 20;

  doc.text(
    `Tax (${invoice.parseTaxRate}% GST): ₹ ${invoice.tax}`,
    350,
    position,
  );

  position += 20;

  doc
    .fontSize(14)
    .text(`Total Amount: ₹ ${invoice.totalAmount}`, 350, position);

  doc.moveDown(5);

  doc
    .fontSize(10)
    .text("Authorized Signature", 400, 700)
    .moveTo(400, 690)
    .lineTo(550, 690)
    .stroke();

  doc
    .fontSize(8)
    .text(
      "This is a computer-generated invoice and does not require a physical signature.",
      50,
      780,
      { align: "center" },
    );

  doc.end();
};

const getCompanyService = () => {
  return {
    name: "Technologies Pvt Ltd",
    address: "401, Business Hub, Andheri East, Mumbai - 400069",
    gst: "27ABCDE1234F1Z5",
    phone: "+91 9876543210",
    email: "info@technologies.com",
    website: "www.technologies.com",
    bankDetails: {
      accountName: "Technologies Pvt Ltd",
      bankName: "HDFC Bank",
      accountNumber: "12345678901234",
      ifsc: "HDFC0001234"
    }
  };
};


export {
  createInvoiceService,
  getInvoicesServices,
  getInvoiceByIdService,
  updateInvoiceService,
  updateInvoiceStatusService,
  deleteInvoiceService,
  downloadInvoiceService,
  getCompanyService
};
