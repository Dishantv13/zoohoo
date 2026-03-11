import { Invoice } from "../model/invoice.model.js";
import { Bill } from "../model/bill.model.js";
import { Payment } from "../model/payment.model.js";
import { User } from "../model/user.model.js";
import ApiError from "../util/apiError.js";

const processCardPaymentService = async (userId, data) => {
  const { invoiceId, billId, cardNumber, cardHolder, expiryDate, cvv, paymentAmount } =
    data;

  if (!invoiceId && !billId) {
    throw new ApiError(400, "invoiceId or billId is required");
  }

  let document;
  let docType = "invoice";

  if (billId) {
    document = await Bill.findById(billId);
    if (!document) {
      throw new ApiError(404, "Bill not found");
    }
    docType = "bill";
  } else {
    document = await Invoice.findById(invoiceId);
    if (!document) {
      throw new ApiError(404, "Invoice not found");
    }

    if (document.customer && document.customer.toString() !== userId.toString()) {
      throw new ApiError(403, "You are not authorized to pay this invoice");
    }
  }

  if (document.status === "PAID") {
    throw new ApiError(400, `${docType} is already paid`);
  }

  if (!paymentAmount || paymentAmount <= 0) {
    throw new ApiError(400, "Invalid payment amount");
  }

  if (paymentAmount > document.remainingAmount) {
    throw new ApiError(400, `Payment amount exceeds remaining ${docType} amount`);
  }

  if (!cardNumber || cardNumber.length < 13) {
    throw new ApiError(400, "Invalid card number");
  }

  if (!cardHolder || cardHolder.trim() === "") {
    throw new ApiError(400, "Card holder name is required");
  }

  if (!expiryDate || expiryDate.trim() === "") {
    throw new ApiError(400, "Expiry date is required");
  }

  if (!cvv || cvv.length < 3) {
    throw new ApiError(400, "Invalid CVV");
  }

  await new Promise((resolve) => setTimeout(resolve, 1500));

  const transactionId = `TXN-CARD-${Date.now()}`;

  document.amountPaid = Number((document.amountPaid || 0) + paymentAmount).toFixed(2);
  document.remainingAmount = Number(document.totalAmount - document.amountPaid).toFixed(2);

  if (document.remainingAmount <= 0) {
    document.remainingAmount = 0;
    document.status = "PAID";
  } else if (document.amountPaid > 0) {
    document.status = "PARTIALLY_PAID";
  }

  if (!document.paymentHistory) {
    document.paymentHistory = [];
  }

  document.paymentHistory.push({
    amount: paymentAmount,
    paymentMethod: "CARD",
    transactionId,
    paidAt: new Date(),
    paidBy: userId,
  });
  await document.save();

  const paymentRecord = {
    user: userId,
    paymentMethod: "CARD",
    transactionId,
    amount: paymentAmount,
  };

  if (docType === "invoice") {
    paymentRecord.invoice = document._id;
    paymentRecord.invoiceNumber = document.invoiceNumber;
  } else {
    paymentRecord.bill = document._id;
  }

  await Payment.create(paymentRecord);

  const result = {
    transactionId,
    paymentMethod: "CARD",
    amountPaid: paymentAmount,
    remainingAmount: document.remainingAmount,
    totalAmountPaid: document.amountPaid,
  };

  if (docType === "invoice") {
    result.invoiceId = document._id;
    result.invoiceNumber = document.invoiceNumber;
    result.invoiceStatus = document.status;
  } else {
    result.billId = document._id;
    result.billStatus = document.status;
  }

  return result;
};

const processQrPaymentService = async (userId, data) => {
  const { invoiceId, billId, qrData, paymentAmount } = data;

  if (!invoiceId && !billId) {
    throw new ApiError(400, "invoiceId or billId is required");
  }

  let document;
  let docType = "invoice";

  if (billId) {
    document = await Bill.findById(billId);
    if (!document) {
      throw new ApiError(404, "Bill not found");
    }
    docType = "bill";
  } else {
    document = await Invoice.findById(invoiceId);
    if (!document) {
      throw new ApiError(404, "Invoice not found");
    }

    if (document.customer && document.customer.toString() !== userId.toString()) {
      throw new ApiError(403, "You are not authorized to pay this invoice");
    }
  }

  if (document.status === "PAID") {
    throw new ApiError(400, `${docType} is already paid`);
  }

  if (!paymentAmount || paymentAmount <= 0) {
    throw new ApiError(400, "Invalid payment amount");
  }

  if (paymentAmount > document.remainingAmount) {
    throw new ApiError(400, `Payment amount exceeds remaining ${docType} amount`);
  }

  if (!qrData || qrData.trim() === "") {
    throw new ApiError(400, "Invalid QR code data");
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const transactionId = `TXN-QR-${Date.now()}`;

  document.amountPaid = Number((document.amountPaid || 0) + paymentAmount).toFixed(2);
  document.remainingAmount = Number(document.totalAmount - document.amountPaid).toFixed(2);

  if (document.remainingAmount <= 0) {
    document.remainingAmount = 0;
    document.status = "PAID";
  } else if (document.amountPaid > 0) {
    document.status = "PARTIALLY_PAID";
  }

  if (!document.paymentHistory) {
    document.paymentHistory = [];
  }

  document.paymentHistory.push({
    amount: paymentAmount,
    paymentMethod: "QR_CODE",
    transactionId,
    paidAt: new Date(),
    paidBy: userId,
  });
  await document.save();

  const paymentRecord = {
    user: userId,
    paymentMethod: "QR_CODE",
    transactionId,
    amount: paymentAmount,
  };

  if (docType === "invoice") {
    paymentRecord.invoice = document._id;
    paymentRecord.invoiceNumber = document.invoiceNumber;
  } else {
    paymentRecord.bill = document._id;
  }

  await Payment.create(paymentRecord);

  const result = {
    transactionId,
    paymentMethod: "QR_CODE",
    amountPaid: paymentAmount,
    remainingAmount: document.remainingAmount,
    totalAmountPaid: document.amountPaid,
  };

  if (docType === "invoice") {
    result.invoiceId = document._id;
    result.invoiceNumber = document.invoiceNumber;
    result.invoiceStatus = document.status;
  } else {
    result.billId = document._id;
    result.billStatus = document.status;
  }

  return result;
};

const processCashPaymentService = async (adminId, data) => {
  const { invoiceId, billId, customerId, vendorId } = data;
  const paymentAmount = Number(data.paymentAmount) || 0;

  if (!invoiceId && !billId) {
    throw new ApiError(400, "invoiceId or billId is required");
  }

  let document;
  let docType = "invoice";

  if (billId) {
    document = await Bill.findById(billId);
    if (!document) {
      throw new ApiError(404, "Bill not found");
    }
    docType = "bill";
  } else {
    document = await Invoice.findById(invoiceId);
    if (!document) {
      throw new ApiError(404, "Invoice not found");
    }
  }

  if (document.status === "PAID") {
    throw new ApiError(400, `${docType} is already paid`);
  }

  if (!paymentAmount || isNaN(paymentAmount) || paymentAmount <= 0) {
    throw new ApiError(400, "Invalid payment amount");
  }

  const currentAmountPaid = Number(document.amountPaid?.toFixed?.(2)) || 0;
  const totalAmount = Number(document.totalAmount?.toFixed?.(2)) || 0;
  const currentRemainingAmount =
    Number(document.remainingAmount?.toFixed?.(2)) || totalAmount;

  if (paymentAmount > currentRemainingAmount) {
    throw new ApiError(
      400,
      `Payment amount ₹${paymentAmount} exceeds remaining ${docType} amount ₹${currentRemainingAmount}`,
    );
  }

  const transactionId = `TXN-CASH-${Date.now()}`;

  document.amountPaid = Number((currentAmountPaid + paymentAmount).toFixed(2));
  document.remainingAmount = Number((totalAmount - document.amountPaid).toFixed(2));

  if (document.remainingAmount <= 0) {
    document.remainingAmount = 0;
    document.status = "PAID";
  } else if (document.amountPaid > 0) {
    document.status = "PARTIALLY_PAID";
  }

  if (!document.paymentHistory) {
    document.paymentHistory = [];
  }

  document.paymentHistory.push({
    amount: paymentAmount,
    paymentMethod: "CASH",
    transactionId,
    paidAt: new Date(),
    paidBy: customerId || vendorId || document.customer || adminId,
  });
  await document.save();

  const paymentRecord = {
    paymentMethod: "CASH",
    transactionId,
    amount: paymentAmount,
    user: customerId || vendorId || document.customer || adminId,
  };

  if (docType === "invoice") {
    paymentRecord.invoice = document._id;
    paymentRecord.invoiceNumber = document.invoiceNumber;
  } else {
    paymentRecord.bill = document._id;
  }

  await Payment.create(paymentRecord);

  const result = {
    transactionId,
    paymentMethod: "CASH",
    amountPaid: paymentAmount,
    remainingAmount: document.remainingAmount,
    totalAmountPaid: document.amountPaid,
    totalAmount: document.totalAmount,
  };

  if (docType === "invoice") {
    result.invoiceId = document._id;
    result.invoiceNumber = document.invoiceNumber;
    result.invoiceStatus = document.status;
  } else {
    result.billId = document._id;
    result.billStatus = document.status;
  }

  return result;
};

const getPaymentStatusService = async (userId, data) => {
  const { invoiceId } = data;
  const invoice = await Invoice.findById(invoiceId);
  const currentUser = await User.findById(userId).select("role");

  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  if (
    currentUser?.role !== "admin" &&
    invoice.customer &&
    invoice.customer.toString() !== userId.toString() &&
    invoice.createdBy.toString() !== userId.toString()
  ) {
    throw new ApiError(403, "Not authorized to view this invoice");
  }

  return {
    invoiceId: invoice._id,
    status: invoice.status,
    isPaid: invoice.status === "PAID",
    totalAmount: invoice.totalAmount,
    amountPaid: invoice.amountPaid,
    remainingAmount: invoice.remainingAmount,
    paymentHistory: invoice.paymentHistory,
  };
};

const getInvoicePaymentHistoryService = async (userId, invoiceId) => {
  const invoice = await Invoice.findById(invoiceId).populate(
    "paymentHistory.paidBy",
    "name email",
  );
  const currentUser = await User.findById(userId).select("role");

  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  if (
    currentUser?.role !== "admin" &&
    invoice.customer &&
    invoice.customer.toString() !== userId.toString() &&
    invoice.createdBy.toString() !== userId.toString()
  ) {
    throw new ApiError(403, "Not authorized to view this invoice");
  }

  return {
    invoiceId: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    totalAmount: invoice.totalAmount,
    amountPaid: invoice.amountPaid,
    remainingAmount: invoice.remainingAmount,
    status: invoice.status,
    paymentHistory: invoice.paymentHistory
      .sort((a, b) => b.paidAt - a.paidAt)
      .slice(0, 4)
      .map((payment) => ({
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        paidAt: payment.paidAt,
        paidBy: payment.paidBy,
      })),
  };
};

const getBillPaymentHistoryService = async (userId, billId) => {
  const bill = await Bill.findById(billId).populate("paymentHistory.paidBy", "name email");
  const currentUser = await User.findById(userId).select("role");

  if (!bill) {
    throw new ApiError(404, "Bill not found");
  }

  if (
    currentUser?.role !== "admin" &&
    bill.vendorId &&
    bill.vendorId.toString() !== userId.toString()
  ) {
    throw new ApiError(403, "Not authorized to view this bill");
  }

  return {
    billId: bill._id,
    // billNumber: bill.billNumber,
    totalAmount: bill.totalAmount,
    amountPaid: bill.amountPaid,
    remainingAmount: bill.remainingAmount,
    status: bill.status,
    paymentHistory: bill.paymentHistory
      .sort((a, b) => b.paidAt - a.paidAt)
      .slice(0, 4)
      .map((payment) => ({
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        paidAt: payment.paidAt,
        paidBy: payment.paidBy,
      })),
  };
};

export {
  processCardPaymentService,
  processQrPaymentService,
  processCashPaymentService,
  getPaymentStatusService,
  getInvoicePaymentHistoryService,
  getBillPaymentHistoryService,
};
