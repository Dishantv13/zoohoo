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
import { successResponse } from "../util/response.js";
import { INVOICE_MESSAGES } from "../util/successMessge.js";
import { HTTP_STATUS } from "../util/httpStatus.js";

const createInvoice = asyncHandler(async (req, res) => {
  const invoice = await createInvoiceService(req.user._id, req.body);

  successResponse(res, invoice, HTTP_STATUS.CREATED, INVOICE_MESSAGES.CREATE);
});

const getInvoices = asyncHandler(async (req, res) => {
  const result = await getInvoicesServices(req.user._id, {
    page: req.query.page,
    limit: req.query.limit,
    status: req.query.status,
  });
  successResponse(res, result, HTTP_STATUS.OK, INVOICE_MESSAGES.GET_ALL);
});

const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await getInvoiceByIdService(req.user._id, req.params.id);

  successResponse(res, invoice, HTTP_STATUS.OK, INVOICE_MESSAGES.GET_ONE);
});

const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await updateInvoiceService(
    req.user._id,
    req.params.id,
    req.body,
  );
  successResponse(res, invoice, HTTP_STATUS.OK, INVOICE_MESSAGES.UPDATE);
});

const updateInvoiceStatus = asyncHandler(async (req, res) => {
  const invoice = await updateInvoiceStatusService(
    req.user._id,
    req.params.id,
    req.body.status,
  );
  successResponse(res, invoice, HTTP_STATUS.OK, INVOICE_MESSAGES.STATUS_UPDATE);
});

const deleteInvoice = asyncHandler(async (req, res) => {
  await deleteInvoiceService(req.user._id, req.params.id);
  successResponse(res, null, HTTP_STATUS.OK, INVOICE_MESSAGES.DELETE);
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
  successResponse(res, result, HTTP_STATUS.OK, INVOICE_MESSAGES.GET_ALL);
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
  successResponse(res, result, HTTP_STATUS.OK, INVOICE_MESSAGES.GET_ALL);
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
