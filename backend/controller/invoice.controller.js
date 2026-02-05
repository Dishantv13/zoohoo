import { Invoice } from "../model/invoice.model.js";

const createInvoice = async (req, res) => {
  const { customer, items, invoiceDate } = req.body;

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.rate, 0
  );

  const tax = subtotal * 0.18;
  const totalAmount = subtotal + tax;

  const invoiceCount = await Invoice.countDocuments();

  console.log("totalAmount", totalAmount);

  const invoice = await Invoice.create({
    invoiceNumber: `INV-${invoiceCount + 1}`,
    customer,
    invoiceDate,
    items,
    subtotal,
    tax,
    totalAmount
  });
  res.status(201).json(invoice);
};

const getInvoices = async (req, res) => {
  const invoices = await Invoice.find()
    .populate("customer", "name email");
    res.json(invoices);
};
export {
    createInvoice,
    getInvoices
}