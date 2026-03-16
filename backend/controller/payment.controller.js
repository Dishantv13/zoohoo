import {
  processCardPaymentService,
  processQrPaymentService,
  processCashPaymentService,
  getPaymentStatusService,
  getInvoicePaymentHistoryService,
  getBillPaymentHistoryService
} from "../service/payment.services.js";

import { asyncHandler } from "../util/asyncHandler.js";
import { successResponse } from "../util/response.js";
import { PAYMENT_MESSAGES } from "../util/successMessge.js";
import { HTTP_STATUS } from "../util/httpStatus.js";

const processCardPayment = asyncHandler(async (req, res) => {
  const result = await processCardPaymentService(req.user._id, req.body);

  successResponse(res, result, HTTP_STATUS.OK, PAYMENT_MESSAGES.CARD);
});

const processQRPayment = asyncHandler(async (req, res) => {
  const result = await processQrPaymentService(req.user._id, req.body);
  successResponse(res, result, HTTP_STATUS.OK, PAYMENT_MESSAGES.UPI);
});

const processCashPayment = asyncHandler(async (req, res) => {
  const result = await processCashPaymentService(req.user._id, req.body);
  successResponse(res, result, HTTP_STATUS.OK, PAYMENT_MESSAGES.CASH);
});

const getPaymentStatus = asyncHandler(async (req, res) => {
  const result = await getPaymentStatusService(req.user._id, {
    invoiceId: req.params.invoiceId,
  });
  successResponse(res, result, HTTP_STATUS.OK, PAYMENT_MESSAGES.PAYMENT_STATUS_RETRIEVED);
});

const getInvoicePaymentHistory = asyncHandler(async (req, res) => {
  const result = await getInvoicePaymentHistoryService(
    req.user._id,
    req.params.invoiceId,
  );
  successResponse(res, result, HTTP_STATUS.OK, PAYMENT_MESSAGES.INVOICE_PAYMENT_HISTORY_RETRIEVED);
});

const getBillPaymentHistory = asyncHandler(async (req, res) => {
  const result = await getBillPaymentHistoryService(
    req.user._id,
    req.params.billId,
  );
  successResponse(res, result, HTTP_STATUS.OK, PAYMENT_MESSAGES.BILL_PAYMENT_HISTORY_RETRIEVED);
});

export {
  processCardPayment,
  processQRPayment,
  processCashPayment,
  getPaymentStatus,
  getInvoicePaymentHistory,
  getBillPaymentHistory
};
