import { Invoice } from "../model/invoice.model.js";
import { Payment } from "../model/payment.model.js";
import { User } from "../model/user.model.js";
import ApiError from "../util/apiError.js";

const processCardPaymentService = async (userId, data) => {
  const { invoiceId, cardNumber, cardHolder, expiryDate, cvv, paymentAmount } =
    data;

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  if (invoice.customer && invoice.customer.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to pay this invoice");
  }

  if (invoice.status === "PAID") {
    throw new ApiError(400, "Invoice is already paid");
  }

  if (!paymentAmount || paymentAmount <= 0) {
    throw new ApiError(400, "Invalid payment amount");
  }

  if (paymentAmount > invoice.remainingAmount) {
    throw new ApiError(400, "Payment amount exceeds remaining invoice amount");
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

  invoice.amountPaid += paymentAmount;
  invoice.remainingAmount = invoice.totalAmount - invoice.amountPaid;

  if (invoice.remainingAmount <= 0) {
    invoice.remainingAmount = 0;
    invoice.status = "PAID";
  } else if (invoice.amountPaid > 0) {
    invoice.status = "PARTIALLY_PAID";
  }

  invoice.paymentHistory.push({
    amount: paymentAmount,
    paymentMethod: "CARD",
    transactionId,
    paidAt: new Date(),
    paidBy: userId,
  });
  await invoice.save();

  await Payment.create({
    invoice: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    user: userId,
    paymentMethod: "CARD",
    transactionId,
    amount: paymentAmount,
  });

  return {
    invoiceId: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    transactionId,
    paymentMethod: "CARD",
    amountPaid: paymentAmount,
    remainingAmount: invoice.remainingAmount,
    totalAmountPaid: invoice.amountPaid,
    invoiceStatus: invoice.status,
  };
};

const processQrPaymentService = async (userId, data) => {
  const { invoiceId, qrData, paymentAmount } = data;

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  if (invoice.customer && invoice.customer.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to pay this invoice");
  }

  if (invoice.status === "PAID") {
    throw new ApiError(400, "Invoice is already paid");
  }

  if (!paymentAmount || paymentAmount <= 0) {
    throw new ApiError(400, "Invalid payment amount");
  }

  if (paymentAmount > invoice.remainingAmount) {
    throw new ApiError(400, "Payment amount exceeds remaining invoice amount");
  }

  if (!qrData || qrData.trim() === "") {
    throw new ApiError(400, "Invalid QR code data");
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const transactionId = `TXN-QR-${Date.now()}`;

  invoice.amountPaid += paymentAmount;
  invoice.remainingAmount = invoice.totalAmount - invoice.amountPaid;

  if (invoice.remainingAmount <= 0) {
    invoice.remainingAmount = 0;
    invoice.status = "PAID";
  } else if (invoice.amountPaid > 0) {
    invoice.status = "PARTIALLY_PAID";
  }

  invoice.paymentHistory.push({
    amount: paymentAmount,
    paymentMethod: "QR_CODE",
    transactionId,
    paidAt: new Date(),
    paidBy: userId,
  });
  await invoice.save();

  await Payment.create({
    invoice: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    user: userId,
    paymentMethod: "QR_CODE",
    transactionId,
    amount: paymentAmount,
  });

  return {
    invoiceId: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    transactionId,
    paymentMethod: "QR_CODE",
    amountPaid: paymentAmount,
    remainingAmount: invoice.remainingAmount,
    totalAmountPaid: invoice.amountPaid,
    invoiceStatus: invoice.status,
  };
};

const processCashPaymentService = async (adminId, data) => {
  const { invoiceId, customerId } = data;

  const paymentAmount = Number(data.paymentAmount) || 0;

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  if (invoice.status === "PAID") {
    throw new ApiError(400, "Invoice is already paid");
  }

  if (!paymentAmount || isNaN(paymentAmount) || paymentAmount <= 0) {
    throw new ApiError(400, "Invalid payment amount");
  }

  const currentAmountPaid = Number(invoice.amountPaid.toFixed(2)) || 0;
  const totalAmount = Number(invoice.totalAmount.toFixed(2)) || 0;
  const currentRemainingAmount =
    Number(invoice.remainingAmount.toFixed(2)) || totalAmount;

  if (paymentAmount > currentRemainingAmount) {
    throw new ApiError(
      400,
      `Payment amount ₹${paymentAmount} exceeds remaining invoice amount ₹${currentRemainingAmount}`,
    );
  }

  const transactionId = `TXN-CASH-${Date.now()}`;

  invoice.amountPaid = currentAmountPaid + paymentAmount;
  invoice.remainingAmount = totalAmount - invoice.amountPaid;

  if (invoice.remainingAmount <= 0) {
    invoice.remainingAmount = 0;
    invoice.status = "PAID";
  } else if (invoice.amountPaid > 0) {
    invoice.status = "PARTIALLY_PAID";
  }

  invoice.paymentHistory.push({
    amount: paymentAmount,
    paymentMethod: "CASH",
    transactionId,
    paidAt: new Date(),
    paidBy: customerId || invoice.customer || adminId,
  });
  await invoice.save();

  await Payment.create({
    invoice: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    user: customerId || invoice.customer || adminId,
    paymentMethod: "CASH",
    transactionId,
    amount: paymentAmount,
  });

  return {
    invoiceId: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    transactionId,
    paymentMethod: "CASH",
    amountPaid: paymentAmount,
    remainingAmount: invoice.remainingAmount,
    totalAmountPaid: invoice.amountPaid,
    totalAmount: invoice.totalAmount,
    invoiceStatus: invoice.status,
  };
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

export {
  processCardPaymentService,
  processQrPaymentService,
  processCashPaymentService,
  getPaymentStatusService,
  getInvoicePaymentHistoryService,
};
