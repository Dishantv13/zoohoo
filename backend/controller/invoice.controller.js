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
  exportInvoiceServices,
} from "../service/invoice.service.js";

import { asyncHandler } from "../util/asyncHandler.js";
import { successResponse, errorResponse } from "../util/response.js";

const createInvoice = asyncHandler(async (req, res) => {
  const invoice = await createInvoiceService(req.user._id, req.body);

  if (!invoice) {
    return errorResponse(res, 400, "Failed to create invoice");
  }
  successResponse(res, invoice, 201, "Invoice created successfully");
});

const getInvoices = asyncHandler(async (req, res) => {
  const result = await getInvoicesServices(req.user._id, {
    page: req.query.page,
    limit: req.query.limit,
    status: req.query.status,
  });
  if (!result) {
    return errorResponse(res, 400, "Failed to retrieve invoices");
  }
  successResponse(res, result, 200, "Invoices retrieved successfully");
});

const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await getInvoiceByIdService(req.user._id, req.params.id);

  if (!invoice) {
    return errorResponse(res, 404, "Invoice not found");
  }

  successResponse(res, invoice, 200, "Invoice retrieved successfully");
});

const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await updateInvoiceService(
    req.user._id,
    req.params.id,
    req.body,
  );
  if (!invoice) {
    return errorResponse(res, 400, "Failed to update invoice");
  }

  successResponse(res, invoice, 200, "Invoice updated successfully");
});

const updateInvoiceStatus = asyncHandler(async (req, res) => {
  const invoice = await updateInvoiceStatusService(
    req.user._id,
    req.params.id,
    req.body.status,
  );
  if (!invoice) {
    return errorResponse(res, 400, "Failed to update invoice status");
  }
  successResponse(res, invoice, 200, "Invoice status updated successfully");
});

const deleteInvoice = asyncHandler(async (req, res) => {
  await deleteInvoiceService(req.user._id, req.params.id);
  successResponse(res, null, 200, "Invoice deleted successfully");
});

const downloadInvoice = asyncHandler(async (req, res, next) => {
  await downloadInvoiceService(req.user._id, req.params.id, res);
});

const getAdminAllInvoices = asyncHandler(async (req, res) => {
  const result = await getAdminAllInvoicesService(req.user._id, {
    page: req.query.page,
    limit: req.query.limit,
    status: req.query.status,
    customerId: req.query.customerId,
  });
  if (!result) {
    return errorResponse(res, 400, "Failed to retrieve invoices");
  }
  successResponse(res, result, 200, "Company invoices retrieved successfully");
});

const getCustomerInvoicesByAdmin = asyncHandler(async (req, res) => {
  const result = await getCustomerInvoicesByAdminService(
    req.user._id,
    req.params.customerId,
    {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
    },
  );
  if (!result) {
    return errorResponse(res, 400, "Failed to retrieve customer invoices");
  }
  successResponse(res, result, 200, "Customer invoices retrieved successfully");
});

const exportInvoice = asyncHandler(async (req, res) => {
  const options = {
    status: req.query.status,
    customerId: req.query.customerId,
  };

  const workbook = await exportInvoiceServices(req.user._id, options);

  const buffer = await workbook.xlsx.writeBuffer();

  let filename = "invoices";
  if (options.customerId) {
    filename += `_customer_${options.customerId}`;
  }
  if (options.status) {
    filename += `_${options.status.toLowerCase()}`;
  }
  filename += `_${new Date().toISOString().split("T")[0]}.xlsx`;
  res.set({
    "Content-Type":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": `attachment; filename=${filename}`,
    "Content-Length": buffer.length,
  });
  return res.end(buffer);
});

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
  exportInvoice,
};
