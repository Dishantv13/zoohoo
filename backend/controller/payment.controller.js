import {
  processCardPaymentService,
  processQrPaymentService,
  processCashPaymentService,
  getPaymentStatusService,
  getInvoicePaymentHistoryService,
} from "../service/payment.services.js";

import { asyncHandler } from "../util/asyncHandler.js";
import { successResponse, errorResponse } from "../util/response.js";

const processCardPayment = asyncHandler(async (req, res) => {
  const result = await processCardPaymentService(req.user._id, req.body);

  successResponse(res, result, 200, "Payment successful via card");
});

const processQRPayment = asyncHandler(async (req, res) => {
  const result = await processQrPaymentService(req.user._id, req.body);
  successResponse(res, result, 200, "Payment Successfull Via Qr Code");
});

const processCashPayment = asyncHandler(async (req, res) => {
  const result = await processCashPaymentService(req.user._id, req.body);
  successResponse(res, result, 200, "Cash payment recorded successfully");
});

const getPaymentStatus = asyncHandler(async (req, res) => {
  const result = await getPaymentStatusService(req.user._id, {
    invoiceId: req.params.invoiceId,
  });
  successResponse(res, result, 200, "payment status retrieved successfully");
});

const getInvoicePaymentHistory = asyncHandler(async (req, res) => {
  const result = await getInvoicePaymentHistoryService(
    req.user._id,
    req.params.invoiceId,
  );
  successResponse(res, result, 200, "Payment history retrieved successfully");
});

export {
  processCardPayment,
  processQRPayment,
  processCashPayment,
  getPaymentStatus,
  getInvoicePaymentHistory,
};
