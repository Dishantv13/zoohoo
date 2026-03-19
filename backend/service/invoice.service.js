import { Invoice } from "../model/invoice.model.js";
import { User } from "../model/user.model.js";
import { Company } from "../model/company.model.js";
import { Counter } from "../model/counter.model.js";
import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import excelJS from "exceljs";
import { INVOICE_ERRORS } from "../util/errorMessage.js";
import { getPagination, getPaginationMeta } from "../util/pagination.js";

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
    throw INVOICE_ERRORS.ITEMS_REQUIRED();
  }

  const user = await User.findById(userId).populate("companyId");
  if (!user) {
    throw INVOICE_ERRORS.USER_NOT_FOUND();
  }

  if (new Date(dueDate) < new Date(invoiceDate)) {
    throw INVOICE_ERRORS.INVALID_DUE_DATE();
  }

  let companyId;
  if (user.role === "admin") {
    companyId = user.companyId?._id;
  } else if (user.role === "customer") {
    companyId = user.companyId;
  }

  if (!companyId) {
    throw INVOICE_ERRORS.USER_NO_COMPANY();
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
  const remainingAmount = finalTotal;

  //   const invoiceCount = await Invoice.countDocuments();

  const counter = await Counter.findOneAndUpdate(
    { name: "invoice" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  const invoice = await Invoice.create({
    invoiceNumber: `INV-${counter.seq}`,
    invoiceCount: counter.seq,
    createdBy: userId,
    customer,
    companyId,
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
    remainingAmount,
  });

  return invoice;
};

const getInvoicesServices = async (userId, options = {}) => {
  const { page, limit, skip } = getPagination(options);

  const { status } = options;

  const user = await User.findById(userId);

  let baseMatch;
  if (user.role === "customer") {
    baseMatch = {
      $or: [{ createdBy: userId }, { customer: userId }],
    };
  } else {
    baseMatch = { createdBy: userId };
  }

  const filteredMatch = {
    ...baseMatch,
    ...(status && status !== "null" ? { status } : {}),
  };

  const summaryMatch = baseMatch;

  const totalItems = await Invoice.countDocuments(filteredMatch);

  const invoices = await Invoice.aggregate([
    { $match: filteredMatch },
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

  const summary = await Invoice.aggregate([
    { $match: summaryMatch },
    {
      $group: {
        _id: userId,
        totalAmount: { $sum: "$totalAmount" },
        paidAmount: { $sum: "$amountPaid" },
        pendingAmount: { $sum: "$remainingAmount" },
        pendingInvoices: {
          $sum: { $cond: [{ $ne: ["$status", "PAID"] }, 1, 0] },
        },
        overdueCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lt: ["$dueDate", new Date()] },
                  { $ne: ["$status", "PAID"] },
                  { $ne: ["$status", "CANCELLED"] },
                ],
              },
              1,
              0,
            ],
          },
        },
        totalInvoices: { $sum: 1 },
      },
    },
  ]);

  const populated = await Invoice.populate(invoices, [
    {
      path: "customer",
      select: "name email",
    },
    {
      path: "createdBy",
      select: "name email role",
    },
  ]);

  return {
    data: populated,
    pagination: getPaginationMeta(totalItems, page, limit),
    summary: summary[0] || {
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      pendingInvoices: 0,
      confirmedAmount: 0,
      overdueCount: 0,
      totalInvoices: 0,
    },
  };
};

const getInvoiceByIdService = async (userId, invoiceId) => {
  const invoice = await Invoice.findById(invoiceId)
    .populate("customer")
    .populate("createdBy", "name email role");

  if (!invoice) {
    throw INVOICE_ERRORS.INVOICE_NOT_FOUND();
  }

  const isCreator = invoice.createdBy._id.toString() === userId.toString();
  const isCustomer =
    invoice.customer && invoice.customer._id.toString() === userId.toString();

  if (!isCreator && !isCustomer) {
    throw INVOICE_ERRORS.NOT_AUTHORIZED_VIEW();
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
    throw INVOICE_ERRORS.ITEMS_REQUIRED();
  }

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    throw INVOICE_ERRORS.INVOICE_NOT_FOUND();
  }

  if (invoice.createdBy.toString() !== userId.toString()) {
    throw INVOICE_ERRORS.NOT_AUTHORIZED_UPDATE();
  }

  if (invoice.status === "PAID" && status !== "PAID") {
    throw INVOICE_ERRORS.PAID_UPDATE_RESTRICTED();
  }

  if (new Date(dueDate) < new Date(invoiceDate)) {
    throw INVOICE_ERRORS.INVALID_DUE_DATE();
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
  const remainingAmount = finalTotal - invoice.amountPaid;

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
    remainingAmount,
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
    throw INVOICE_ERRORS.INVOICE_NOT_FOUND();
  }

  if (invoice.createdBy.toString() !== userId.toString()) {
    throw INVOICE_ERRORS.NOT_AUTHORIZED_STATUS();
  }

  invoice.status = newStatus;
  await invoice.save();

  return invoice;
};

const deleteInvoiceService = async (userId, invoiceId) => {
  const invoice = await Invoice.findById(invoiceId);

  if (!invoice) {
    throw INVOICE_ERRORS.INVOICE_NOT_FOUND();
  }

  if (invoice.createdBy.toString() !== userId.toString()) {
    throw INVOICE_ERRORS.NOT_AUTHORIZED_DELETE();
  }

  if (invoice.status === "PAID") {
    throw INVOICE_ERRORS.PAID_DELETE_RESTRICTED();
  }

  await Invoice.findByIdAndDelete(invoiceId);
};

const downloadInvoiceService = async (userId, invoiceId, res) => {
  const invoice = await Invoice.findById(invoiceId).populate("customer");
  const company = await Company.findById(invoice.companyId);
  const user = await User.findById(userId);

  if (!invoice) {
    throw INVOICE_ERRORS.INVOICE_NOT_FOUND();
  }
  if (!company) {
    throw INVOICE_ERRORS.COMPANY_NOT_FOUND();
  }

  const isCreator = invoice.createdBy.toString() === userId.toString();
  const isAdmin =
    user.role === "admin" && company.adminId.toString() === userId.toString();
  const isCustomer =
    invoice.customer && invoice.customer._id.toString() === userId.toString();

  if (!isCreator && !isAdmin && !isCustomer) {
    throw INVOICE_ERRORS.NOT_AUTHORIZED_VIEW();
  }

  const formatCurrency = (value) =>
    `₹ ${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (value) =>
    new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const doc = new PDFDocument({ size: "A4", margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`,
  );

  doc.pipe(res);

  doc.registerFont("NotoSans", "./fonts/NotoSans-Regular.ttf");
  doc.registerFont("NotoSans-Bold", "./fonts/NotoSans-Bold.ttf");

  const margin = 50;
  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - margin * 2;

  /* ================= HEADER ================= */

  doc.rect(margin, 40, contentWidth, 110).fill("#f5f7fb");

  doc
    .font("NotoSans-Bold")
    .fontSize(20)
    .fillColor("#111827")
    .text(company.name, margin + 20, 55);

  doc
    .font("NotoSans")
    .fontSize(9)
    .fillColor("#4b5563")
    .text(company.address, margin + 20, 80, { width: contentWidth / 2 - 10 })
    .text(`GST: ${company.gstNumber}`)
    .text(`${company.email} | ${company.phonenumber}`)
    .text(company.website);

  const boxX = margin + contentWidth - 220;
  const boxY = 50;

  doc.rect(boxX, boxY, 200, 90).fill("#f5f7fb");

  doc
    .font("NotoSans-Bold")
    .fontSize(18)
    .fillColor("#111827")
    .text("INVOICE", boxX + 15, boxY + 5);

  doc
    .font("NotoSans")
    .fontSize(9)
    .fillColor("#6b7280")
    .text(`Invoice No: ${invoice.invoiceNumber}`, boxX + 15, boxY + 30)
    .text(`Invoice Date: ${formatDate(invoice.invoiceDate)}`)
    .text(`Due Date: ${formatDate(invoice.dueDate)}`);

  const statusColors = {
    PAID: "#16a34a",
    CONFIRMED: "#2563eb",
    PENDING: "#f59e0b",
    CANCELLED: "#dc2626",
  };

  doc
    .roundedRect(boxX + 115, boxY + 12, 70, 18, 4)
    .fill(statusColors[invoice.status] || "#6b7280");

  doc
    .font("NotoSans-Bold")
    .fontSize(8)
    .fillColor("#ffffff")
    .text(invoice.status, boxX + 115, boxY + 15, {
      width: 70,
      align: "center",
    });

  /* ================= BILL SECTION ================= */

  const billTop = 170;
  const boxHeight = 100;

  doc
    .rect(margin, billTop, contentWidth / 2 - 10, boxHeight)
    .fill("#f8fafc")
    .stroke("#e5e7eb");

  doc
    .font("NotoSans-Bold")
    .fontSize(11)
    .fillColor("#111827")
    .text("Bill From", margin + 15, billTop + 10);

  doc
    .font("NotoSans")
    .fontSize(9)
    .fillColor("#374151")
    .text(`Name: ${company.name}`, margin + 15, billTop + 30, {
      width: contentWidth / 2 - 35,
    })
    .text(`Email: ${company.email}`, { width: contentWidth / 2 - 35 })
    .text(`Phone: ${company.phone}`, { width: contentWidth / 2 - 35 })
    .text(`Address: ${company.address}`, { width: contentWidth / 2 - 35 });

  const fromX = margin + contentWidth / 2 + 10;

  doc
    .rect(fromX, billTop, contentWidth / 2 - 10, boxHeight)
    .fill("#f8fafc")
    .stroke("#e5e7eb");

  doc
    .font("NotoSans-Bold")
    .fontSize(11)
    .fillColor("#111827")
    .text("Bill To", fromX + 15, billTop + 10);

  doc
    .font("NotoSans")
    .fontSize(9)
    .fillColor("#374151")
    .text(`Name: ${invoice.customer?.name || "-"}`, fromX + 15, billTop + 30, {
      width: contentWidth / 2 - 35,
    })
    .text(`Email: ${invoice.customer?.email || "-"}`, {
      width: contentWidth / 2 - 35,
    })
    .text(`Phone: ${invoice.customer?.phonenumber || "-"}`, {
      width: contentWidth / 2 - 35,
    })
    .text(`Address: ${invoice.customer?.address || "-"}`, {
      width: contentWidth / 2 - 35,
    });

  /* ================= ITEMS TABLE ================= */

  let y = billTop + boxHeight + 30;
  const pageHeight = doc.page.height;
  const bottomMargin = 100;
  const itemRowHeight = 20;
  const headerRowHeight = 22;

  const renderTableHeader = () => {
    doc.rect(margin, y, contentWidth, headerRowHeight).fill("#111827");

    doc
      .font("NotoSans-Bold")
      .fontSize(9)
      .fillColor("#ffffff")
      .text("#", margin + 5, y + 7)
      .text("Item", margin + 40, y + 7)
      .text("Qty", margin + 280, y + 7)
      .text("Rate", margin + 330, y + 7)
      .text("Amount", margin + 420, y + 7);

    y += headerRowHeight + 5;
  };

  renderTableHeader();

  invoice.items.forEach((item, i) => {
    const qty = Number(item.quantity || 0);
    const rate = Number(item.rate || 0);
    const amount = qty * rate;

    if (y + itemRowHeight + bottomMargin > pageHeight) {
      doc.addPage({ size: "A4", margin: 50 });
      y = margin + 30;
      renderTableHeader();
    }

    if (i % 2 === 0)
      doc.rect(margin, y - 4, contentWidth, itemRowHeight).fill("#f9fafb");

    doc
      .font("NotoSans")
      .fontSize(9)
      .fillColor("#111827")
      .text(i + 1, margin + 5, y + 3)
      .text(item.name || item.description || "-", margin + 40, y + 3)
      .text(qty.toString(), margin + 280, y + 3)
      .text(formatCurrency(rate), margin + 330, y + 3)
      .text(formatCurrency(amount), margin + 420, y + 3);

    y += itemRowHeight;
  });

  /* ================= TOTAL SECTION ================= */

  y += 20;

  const totalsX = margin + contentWidth - 260;
  const totalsBoxHeight = 120;

  // Ensure totals box fits on current page
  if (y + totalsBoxHeight + 50 > pageHeight) {
    doc.addPage({ size: "A4", margin: 50 });
    y = margin + 30;
  }

  doc.rect(totalsX, y, 260, totalsBoxHeight).fill("#f8fafc").stroke("#e5e7eb");

  doc
    .moveTo(totalsX + 12, y + 93)
    .lineTo(totalsX + 248, y + 93)
    .stroke();

  const totals = [
    { label: "Subtotal", value: invoice.subtotal },
    { label: "Discount", value: invoice.discount },
    { label: "Amount after Discount", value: invoice.amountAfterDiscount },
    { label: "Tax", value: invoice.tax },
    { label: "Total", value: invoice.totalAmount, bold: true },
  ];

  totals.forEach((t, i) => {
    const ty = y + 12 + i * 22;

    doc
      .font("NotoSans")
      .fontSize(t.bold ? 11 : 9)
      .fillColor("#111827")
      .text(t.label, totalsX + 12, ty)
      .text(formatCurrency(t.value), totalsX + 140, ty, {
        width: 100,
        align: "right",
      });
  });

  const totalsBottomY = y + totalsBoxHeight;

  const signatureY = totalsBottomY + 40;

  doc
    .font("NotoSans")
    .fontSize(10)
    .fillColor("#111827")
    .text("Authorized Signature", totalsX + 90, signatureY + 20);

  doc
    .moveTo(totalsX + 60, signatureY + 15)
    .lineTo(totalsX + 200, signatureY + 15)
    .stroke();

  doc.end();
};

const getAdminAllInvoicesService = async (adminId, options = {}) => {
  const { page, limit, skip } = getPagination(options);

  const { status, customerId } = options;

  const admin = await User.findById(adminId).populate("companyId");
  if (!admin || admin.role !== "admin") {
    throw INVOICE_ERRORS.ADMIN_ONLY_VIEW();
  }

  const companyId = admin.companyId?._id;

  const filteredMatch = {
    companyId,
    ...(status && status !== "null" ? { status } : {}),
    ...(customerId ? { customer: customerId } : {}),
  };

  const totalItems = await Invoice.countDocuments(filteredMatch);

  const invoices = await Invoice.aggregate([
    { $match: filteredMatch },
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

  const summary = await Invoice.aggregate([
    { $match: { companyId } },
    {
      $group: {
        _id: companyId,
        totalAmount: { $sum: "$totalAmount" },
        paidAmount: { $sum: "$amountPaid" },
        pendingAmount: { $sum: "$remainingAmount" },
        pendingInvoices: {
          $sum: { $cond: [{ $ne: ["$status", "PAID"] }, 1, 0] },
        },
        overdueCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lt: ["$dueDate", new Date()] },
                  { $ne: ["$status", "PAID"] },
                  { $ne: ["$status", "CANCELLED"] },
                ],
              },
              1,
              0,
            ],
          },
        },
        totalInvoices: { $sum: 1 },
      },
    },
  ]);

  const populated = await Invoice.populate(invoices, [
    {
      path: "customer",
      select: "name email phonenumber",
    },
    {
      path: "createdBy",
      select: "name email role",
    },
  ]);

  return {
    data: populated,
    pagination: getPaginationMeta(totalItems, page, limit),
    summary: summary[0] || {
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      pendingInvoices: 0,
      confirmedAmount: 0,
      overdueCount: 0,
      totalInvoices: 0,
    },
  };
};

const getCustomerInvoicesByAdminService = async (
  adminId,
  customerId,
  options = {},
) => {
  const { page, limit, skip } = getPagination(options);

  const { status } = options;

  const admin = await User.findById(adminId).populate("companyId");
  if (!admin || admin.role !== "admin") {
    throw INVOICE_ERRORS.ADMIN_ONLY_CUSTOMER_VIEW();
  }

  const customer = await User.findById(customerId);
  if (
    !customer ||
    customer.companyId.toString() !== admin.companyId._id.toString()
  ) {
    throw INVOICE_ERRORS.CUSTOMER_NOT_FOUND();
  }

  const customerObjId = new mongoose.Types.ObjectId(customerId);
  const companyObjId = new mongoose.Types.ObjectId(admin.companyId._id);

  const filteredMatch = {
    companyId: companyObjId,
    customer: customerObjId,
    ...(status && status !== "null" ? { status } : {}),
  };

  const totalItems = await Invoice.countDocuments({
    companyId: admin.companyId._id,
    customer: customerId,
    ...(status && status !== "null" ? { status } : {}),
  });

  const invoices = await Invoice.aggregate([
    { $match: filteredMatch },
    { $addFields: { isPaid: { $cond: [{ $eq: ["$status", "PAID"] }, 1, 0] } } },
    { $sort: { isPaid: 1, dueDate: 1, createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ]);

  const summary = await Invoice.aggregate([
    { $match: filteredMatch },
    {
      $group: {
        _id: customerObjId,
        totalAmount: { $sum: "$totalAmount" },
        paidAmount: { $sum: "$amountPaid" },
        pendingAmount: { $sum: "$remainingAmount" },
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
                ],
              },
              1,
              0,
            ],
          },
        },
        totalInvoices: { $sum: 1 },
      },
    },
  ]);

  const populated = await Invoice.populate(invoices, [
    {
      path: "customer",
      select: "name email phonenumber",
    },
    {
      path: "createdBy",
      select: "name email role",
    },
  ]);

  return {
    customer: {
      id: customer._id,
      name: customer.name,
      email: customer.email,
      phonenumber: customer.phonenumber,
    },
    data: populated,
    pagination: getPaginationMeta(totalItems, page, limit),
    summary: summary[0] || {
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      confirmedAmount: 0,
      overdueCount: 0,
      totalInvoices: 0,
    },
  };
};

const exportInvoiceServices = async (userId, option = {}) => {
  const user = await User.findById(userId);

  let query = {};

  if (user.role === "admin") {
    if (
      option.customerId &&
      mongoose.Types.ObjectId.isValid(option.customerId)
    ) {
      query = {
        $or: [
          { customer: option.customerId },
          { createdBy: option.customerId },
        ],
      };
    } else {
      query = { companyId: user.companyId };
    }
  } else if (user.role === "customer") {
    query = {
      $or: [{ createdBy: userId }, { customer: userId }],
    };
  }

  if (option.status) {
    query.status = option.status;
  }

  const invoices = await Invoice.find(query)
    .populate("customer", "name email phonenumber")
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });

  const workbook = new excelJS.Workbook();
  const worksheet = workbook.addWorksheet("Invoices");

  worksheet.columns = [
    { header: "Invoice Number", key: "invoiceNumber", width: 20 },
    { header: "Customer Name", key: "customerName", width: 30 },
    { header: "Customer Email", key: "customerEmail", width: 30 },
    { header: "Created By", key: "createdBy", width: 25 },
    { header: "Invoice Date", key: "invoiceDate", width: 15 },
    { header: "Due Date", key: "dueDate", width: 15 },
    { header: "Status", key: "status", width: 15 },
    { header: "Subtotal", key: "subtotal", width: 20 },
    { header: "Discount", key: "discount", width: 20 },
    { header: "Amount After Discount", key: "amountAfterDiscount", width: 20 },
    { header: "Tax", key: "tax", width: 20 },
    { header: "Total Amount", key: "totalAmount", width: 20 },
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD3D3D3" },
  };

  const currencyFormat = '"₹" #,##,##0.00;[Red]-"₹" #,##,##0.00';

  worksheet.getColumn("subtotal").numFmt = currencyFormat;
  worksheet.getColumn("discount").numFmt = currencyFormat;
  worksheet.getColumn("amountAfterDiscount").numFmt = currencyFormat;
  worksheet.getColumn("tax").numFmt = currencyFormat;
  worksheet.getColumn("totalAmount").numFmt = currencyFormat;
  worksheet.getColumn("invoiceDate").numFmt = "dd-mm-yyyy";
  worksheet.getColumn("dueDate").numFmt = "dd-mm-yyyy";

  worksheet.getColumn("invoiceNumber").alignment = { horizontal: "left" };
  worksheet.getColumn("customerName").alignment = { horizontal: "left" };
  worksheet.getColumn("customerEmail").alignment = { horizontal: "left" };
  worksheet.getColumn("createdBy").alignment = { horizontal: "left" };

  worksheet.getColumn("invoiceDate").alignment = { horizontal: "center" };
  worksheet.getColumn("dueDate").alignment = { horizontal: "center" };
  worksheet.getColumn("status").alignment = { horizontal: "center" };

  worksheet.getColumn("subtotal").alignment = { horizontal: "left" };
  worksheet.getColumn("discount").alignment = { horizontal: "left" };
  worksheet.getColumn("amountAfterDiscount").alignment = { horizontal: "left" };
  worksheet.getColumn("tax").alignment = { horizontal: "left" };
  worksheet.getColumn("totalAmount").alignment = { horizontal: "left" };

  let totalAmount = 0;
  let totalSubtotal = 0;
  let totalDiscount = 0;
  let totalAmountAfterDiscount = 0;
  let totalTax = 0;

  invoices.forEach((inv) => {
    totalAmount += inv.totalAmount;
    totalSubtotal += inv.subtotal;
    totalDiscount += inv.discount;
    totalAmountAfterDiscount += inv.amountAfterDiscount;
    totalTax += inv.tax;

    worksheet.addRow({
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customer ? inv.customer.name : "N/A",
      customerEmail: inv.customer ? inv.customer.email : "N/A",
      createdBy: inv.createdBy
        ? `${inv.createdBy.name} (${inv.createdBy.role})`
        : "N/A",
      invoiceDate: inv.invoiceDate,
      dueDate: inv.dueDate,
      status: inv.status,
      subtotal: inv.subtotal,
      discount: inv.discount,
      amountAfterDiscount: inv.amountAfterDiscount,
      tax: inv.tax,
      totalAmount: inv.totalAmount,
    });
  });

  worksheet.addRow({});
  const summaryRow = worksheet.addRow({
    invoiceNumber: "TOTAL",
    customerName: `${invoices.length} invoices`,
    subtotal: totalSubtotal,
    discount: totalDiscount,
    amountAfterDiscount: totalAmountAfterDiscount,
    tax: totalTax,
    totalAmount: totalAmount,
  });

  summaryRow.font = { bold: true };
  summaryRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFEB3B" },
  };

  return workbook;
};

export {
  createInvoiceService,
  getInvoicesServices,
  getInvoiceByIdService,
  updateInvoiceService,
  updateInvoiceStatusService,
  deleteInvoiceService,
  downloadInvoiceService,
  getAdminAllInvoicesService,
  getCustomerInvoicesByAdminService,
  exportInvoiceServices,
};
