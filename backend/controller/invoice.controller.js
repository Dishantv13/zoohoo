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
  console.log("items",items)
  res.status(201).json(invoice);
};



const getInvoices = async (req, res) => {
  const invoices = await Invoice.find()
    .populate("customer", "name email");
    res.status(200).json(invoices);
};

const getInvoiceById = async (req, res) => {
  try {
    const invoices = await Invoice.findById(req.params.id).populate("customer");

    if (!invoices) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    console.log("invoice",invoices)

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateInvoice = async (req,res) => {
  const {items, invoiceDate, customer} = req.body;

  const subtotal = items.reduce(
    (sum,i) => sum+i.quantity * i.rate,0
  );
  const tax = subtotal * 0.18;
  const totalAmount = subtotal + tax;

  const invoice = await Invoice.findByIdAndUpdate(req.params.id,
    {
      customer,
      invoiceDate,
      items,
      subtotal,
      tax,
      totalAmount
    },
    {new:true}
  )

  if(!invoice){
    return res.status(404).json({ message: "invoice not found"})
  }

  res.status(200).json(invoice)

}

const deleteInvoice = async (req,res) => {
  const invoice = await Invoice.findByIdAndDelete(req.params.id)

  if (!invoice) {
    return res.status(404).json({ message: "invoice not found"})
  } else {
    res.json( {message: "invoice delete successfull"})
  }
   res.status(204).json(invoice)
}

export {
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice
}