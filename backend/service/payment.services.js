import { Invoice } from "../model/invoice.model.js";
import { Payment } from "../model/payment.model.js";

const processCardPaymentService = async (userId, data) => {
  const { invoiceId, cardNumber, cardHolder, expiryDate, cvv } = data;

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (invoice.createdBy.toString() !== userId.toString()) {
    throw new Error("Not authorized to pay this invoice");
  }

  if (invoice.status === "PAID") {
    throw new Error("Invoice is already paid");
  }

  if (!cardNumber || cardNumber.length < 13) {
    throw new Error("Invalid card number");
  }

  if (!cardHolder || cardHolder.trim() === "") {
    throw new Error("Card holder name is required");
  }

  if (!expiryDate || expiryDate.trim() === "") {
    throw new Error("Expiry date is required");
  }

  if (!cvv || cvv.length < 3) {
    throw new Error("Invalid CVV");
  }

  await new Promise((resolve) => setTimeout(resolve, 1500));

  const transactionId = `TXN-CARD-${Date.now()}`;

  invoice.status = "PAID";
  await invoice.save();

  await Payment.create({
    invoice: invoice._id,
    invoiceNumber: invoice._id,
    user: userId,
    paymentMethod: "CARD",
    transactionId,
    amount: invoice.totalAmount,
  });

  return {
    invoice,
    transactionId,
    paymentMethod: "CARD",
    amount: invoice.totalAmount,
  };
};

const processQrPaymentService = async (userId, data) => {
  const { invoiceId, qrData } = data;

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (invoice.createdBy.toString() !== userId.toString()) {
    throw new Error("Not authorized to pay this invoice");
  }

  if (invoice.status === "PAID") {
    throw new Error("Invoice is already paid");
  }

  if (!qrData || qrData.trim() === "") {
    throw new Error("Invalid QR code data");
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const transactionId = `TXN-QR-${Date.now()}`;

  invoice.status = "PAID";
  await invoice.save();

  await Payment.create({
    invoice: invoice._id,
    user: userId,
    paymentMethod: "QR_CODE",
    transactionId,
    amount: invoice.totalAmount,
  });

  return {
    invoice,
    transactionId,
    paymentMethod: "QR_CODE",
    amount: invoice.totalAmount,
  };
};

const getPaymentStatusService = async (userId, data) => {
  const { invoiceId } = data;
  const invoice = await Invoice.findById(invoiceId);

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (invoice.createdBy.toString() !== userId.toString()) {
    throw new Error("Not authorized to view this invoice");
  }

  return {
    invoiceId: invoice._id,
    status: invoice.status,
    isPaid: invoice.status === "PAID",
    totalAmount: invoice.totalAmount,
  };
};

export {
  processCardPaymentService,
  processQrPaymentService,
  getPaymentStatusService,
};
