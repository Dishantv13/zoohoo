import { Invoice } from "../model/invoice.model.js"

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
      totalAmount: finalTotal
    });
    return invoice;

};

const getInvoicesServices = async (userId) => {
    const invoices = await Invoice.find({ createdBy: userId })
          .populate("customer", "name email")
          .sort({ dueDate: 1 });
    
        const sortedInvoices = invoices.sort((a, b) => {
          if (a.status === "PAID" && b.status !== "PAID") return 1;
          if (a.status !== "PAID" && b.status === "PAID") return -1;
          return 0;
        });
        
        return sortedInvoices;
}

const getInvoiceByIdService = async (userId, invoiceId) => {
    const invoice = await Invoice.findById(invoiceId).populate("customer");

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (invoice.createdBy.toString() !== userId.toString()) {
      throw new Error("Not authorized to access this invoice");
    }

    return invoice;
}

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
    invoice.subTotal = finalSubtotal;
    invoice.parseTaxRate = parsedTaxRate;
    invoice.tax = finalTax;
    invoice.parseDiscount = parsedDiscount;
    invoice.amountAfterDiscount = amountAfterDiscount;
    invoice.discount = discountAmount;
    invoice.totalAmount = finalTotal;

    await invoice.save();
    
    return invoice;
}

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
}

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
}

export  {
    createInvoiceService,
    getInvoicesServices,
    getInvoiceByIdService,
    updateInvoiceService,
    updateInvoiceStatusService,
    deleteInvoiceService
}