import { Invoice } from "../model/invoice.model.js";
import { Payment } from "../model/payment.model.js"

const processCardPayment = async (req, res) => {
  try {
    const { invoiceId, cardNumber, cardHolder, expiryDate, cvv } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to pay this invoice" });
    }

    if (invoice.status === "PAID") {
      return res.status(400).json({ message: "Invoice is already paid" });
    }

    if (!cardNumber || cardNumber.length < 13) {
      return res.status(400).json({ message: "Invalid card number" });
    }

    if (!cardHolder || cardHolder.trim() === "") {
      return res.status(400).json({ message: "Card holder name is required" });
    }

    if (!expiryDate || expiryDate.trim() === "") {
      return res.status(400).json({ message: "Expiry date is required" });
    }

    if (!cvv || cvv.length < 3) {
      return res.status(400).json({ message: "Invalid CVV" });
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const transactionId = `TXN-QR-${Date.now()}`;

    invoice.status = "PAID";
    await invoice.save();

    await Payment.create({
    invoice: invoice._id,
    invoiceNumber: invoice._id,
    user: req.user._id,
    paymentMethod: "CARD",
    transactionId,
    amount: invoice.totalAmount,
    });

    res.status(200).json({
      message: "Payment processed successfully via card",
      success: true,
      invoice,
      transactionId: `TXN-CARD-${Date.now()}`,
      paymentMethod: "CARD",
      amount: invoice.totalAmount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const processQRPayment = async (req, res) => {
  try {
    const { invoiceId, qrData } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to pay this invoice" });
    }

    if (invoice.status === "PAID") {
      return res.status(400).json({ message: "Invoice is already paid" });
    }

    if (!qrData || qrData.trim() === "") {
      return res.status(400).json({ message: "Invalid QR code data" });
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const transactionId = `TXN-QR-${Date.now()}`;

    invoice.status = "PAID";
    await invoice.save();

    await Payment.create({
    invoice: invoice._id,
    user: req.user._id,
    paymentMethod: "QR_CODE",
    transactionId,
    amount: invoice.totalAmount,
    });

    res.status(200).json({
      message: "Payment processed successfully via QR code",
      success: true,
      invoice,
      transactionId: `TXN-QR-${Date.now()}`,
      paymentMethod: "QR_CODE",
      amount: invoice.totalAmount,
  });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getPaymentStatus = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.invoiceId);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.status(200).json({
      message: "Payment fetch successfully",
      invoiceId: invoice._id,
      status: invoice.status,
      isPaid: invoice.status === "PAID",
      totalAmount: invoice.totalAmount,
      
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { processCardPayment, processQRPayment, getPaymentStatus };
