import {
  createInvoiceService,
  getInvoicesServices,
  getInvoiceByIdService,
  updateInvoiceService,
  updateInvoiceStatusService,
  deleteInvoiceService,
  downloadInvoiceService,
  getCompanyService,
} from "../service/invoice.service.js";

const createInvoice = async (req, res) => {
  try {
    const invoice = await createInvoiceService(req.user._id, req.body);
    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getInvoices = async (req, res) => {
  try {
    const result = await getInvoicesServices(req.user._id, {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
    });
    res.status(200).json({
      success: true,
      message: "Invoices retrieved successfully",
      ...result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const invoice = await getInvoiceByIdService(req.user._id, req.params.id);

    const company = getCompanyService();

    res.status(200).json({
      success: true,
      message: "Invoice retrieved successfully",
      invoice,
      company,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const invoice = await updateInvoiceService(
      req.user._id,
      req.params.id,
      req.body,
    );
    res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      invoice,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateInvoiceStatus = async (req, res) => {
  try {
    const invoice = await updateInvoiceStatusService(
      req.user._id,
      req.params.id,
      req.body.status,
    );
    res.status(200).json({
      success: true,
      message: "Invoice status updated successfully",
      invoice,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    await deleteInvoiceService(req.user._id, req.params.id);
    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const downloadInvoice = async (req, res, next) => {
  try {
    await downloadInvoiceService(req.user._id, req.params.id, res);
  } catch (error) {
    next(error);
  }
};

export {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  downloadInvoice,
};
