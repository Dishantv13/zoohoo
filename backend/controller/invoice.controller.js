import { Invoice } from "../model/invoice.model.js";

const createInvoice = async (req, res) => {
  const { customer, items, invoiceDate, dueDate, status } = req.body;

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.rate, 0
  );

  const tax = subtotal * 0.18;
  const totalAmount = subtotal + tax;

  const invoiceCount = await Invoice.countDocuments();

  const invoice = await Invoice.create({
    invoiceNumber: `INV-${invoiceCount + 1}`,
    createdBy: req.user._id,
    customer,
    invoiceDate,
    dueDate,
    status: status || 'PENDING',
    items,
    subtotal,
    tax,
    totalAmount
  });

  console.log("invoice",invoice)

  res.status(201).json(invoice);
};


const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ createdBy: req.user._id })
      .populate("customer", "name email")
      .sort({ dueDate: 1 });

    const sortedInvoices = invoices.sort((a, b) => {
      if (a.status === "PAID" && b.status !== "PAID") return 1;
      if (a.status !== "PAID" && b.status === "PAID") return -1;
      return 0;
    });

    res.status(200).json(sortedInvoices);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate("customer");

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this invoice' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateInvoice = async (req, res) => {
  try {
    const { items, invoiceDate, customer, dueDate, status } = req.body;

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (invoice.status === "PAID" && status !== "PAID") {
      return res.status(400).json({
        message: "Paid invoice cannot be updated",
      });
    }

    const subTotal = items.reduce(
      (sum, i) => sum + i.quantity * i.rate,
      0
    );
    const tax = subTotal * 0.18;
    const totalAmount = subTotal + tax;

    invoice.customer = customer;
    invoice.invoiceDate = invoiceDate;
    invoice.dueDate = dueDate;
    invoice.status = status || invoice.status;
    invoice.items = items;
    invoice.subTotal = subTotal;
    invoice.tax = tax;
    invoice.totalAmount = totalAmount;

    await invoice.save();

   
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    invoice.status = status;
    await invoice.save();

    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (invoice.status === "PAID") {
      return res.status(400).json({
        message: "Paid invoice cannot be deleted",
      });
    }

    await invoice.deleteOne();
    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoice,
    updateInvoiceStatus,
    deleteInvoice
}