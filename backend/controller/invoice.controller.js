import {
  createInvoiceService,
  getInvoicesServices,
  getInvoiceByIdService,
  updateInvoiceService,
  updateInvoiceStatusService,
  deleteInvoiceService,
  downloadInvoiceService,
  getAdminAllInvoicesService,
  getCustomerInvoicesByAdminService,
} from "../service/invoice.service.js";

import ApiResponse from "../util/apiResponse.js";
import ApiError from "../util/apiError.js";

const createInvoice = async (req, res) => {
  try {
    const invoice = await createInvoiceService(req.user._id, req.body);
    res
      .status(201)
      .json(
        new ApiResponse(
            201, 
            "Invoice created successfully", 
            invoice
        ));
  } catch (error) {
    res.status(400).json(new ApiError(400, error.message));
  }
};

const getInvoices = async (req, res) => {
  try {
    const result = await getInvoicesServices(req.user._id, {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
    });
    res
      .status(200)
      .json(
        new ApiResponse(
            200, 
            "Invoices retrieved successfully", 
            result
        ));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const invoice = await getInvoiceByIdService(req.user._id, req.params.id);

    res
      .status(200)
      .json(
        new ApiResponse(
            200, 
            "Invoice retrieved successfully", 
            invoice
        ));
  } catch (error) {
    res.status(404).json(new ApiError(404, error.message));
  }
};

const updateInvoice = async (req, res) => {
  try {
    const invoice = await updateInvoiceService(
      req.user._id,
      req.params.id,
      req.body,
    );
    res
      .status(200)
      .json(
        new ApiResponse(
            200, 
            "Invoice updated successfully", 
            invoice
        ));
  } catch (error) {
    res.status(400).json(new ApiError(400, error.message));
  }
};

const updateInvoiceStatus = async (req, res) => {
  try {
    const invoice = await updateInvoiceStatusService(
      req.user._id,
      req.params.id,
      req.body.status,
    );
    res
      .status(200)
      .json(
        new ApiResponse(
            200, 
            "Invoice status updated successfully", 
            invoice
        ));
  } catch (error) {
    res.status(400).json(new ApiError(400, error.message));
  }
};

const deleteInvoice = async (req, res) => {
  try {
    await deleteInvoiceService(req.user._id, req.params.id);
    res
      .status(200)
      .json(
        new ApiResponse(
            200, 
            "Invoice deleted successfully"
        ));
  } catch (error) {
    res.status(400).json(new ApiError(400, error.message));
  }
};

const downloadInvoice = async (req, res, next) => {
  try {
    await downloadInvoiceService(req.user._id, req.params.id, res);
  } catch (error) {
    next(error);
  }
};

const getAdminAllInvoices = async (req, res) => {
  try {
    const result = await getAdminAllInvoicesService(req.user._id, {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
      customerId: req.query.customerId,
    });
    res
      .status(200)
      .json(
        new ApiResponse(
            200, 
            "Company invoices retrieved successfully", 
            result
        ));
  } catch (error) {
    res.status(403).json(new ApiError(403, error.message));
  }
};

const getCustomerInvoicesByAdmin = async (req, res) => {
  try {
    const result = await getCustomerInvoicesByAdminService(
      req.user._id,
      req.params.customerId,
      {
        page: req.query.page,
        limit: req.query.limit,
        status: req.query.status,
      },
    );
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Customer invoices retrieved successfully",
          result,
        ));
  } catch (error) {
    res.status(403).json(new ApiError(403, error.message));
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
  getAdminAllInvoices,
  getCustomerInvoicesByAdmin,
};
