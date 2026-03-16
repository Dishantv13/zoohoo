import {
  createBillService,
  getBillsService,
  getBillByIdService,
  updateBillService,
  deleteBillService,
  updateBillStatusService,
  getBillsStatsService,
} from "../service/bill.services.js";

import { asyncHandler } from "../util/asyncHandler.js";
import { successResponse } from "../util/response.js";
import { BILL_MESSAGES } from "../util/successMessge.js";
import { HTTP_STATUS } from "../util/httpStatus.js";

const createBill = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;
  const result = await createBillService(req.body, companyId);
  successResponse(res, result, HTTP_STATUS.CREATED, BILL_MESSAGES.CREATE);
});

const getBills = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;
  const { vendorId, status } = req.query;
  const filters = {
    page: req.query.page,
    limit: req.query.limit,
    vendorId,
    status,
  };
  
  const bills = await getBillsService(companyId, filters);
  successResponse(res, bills, HTTP_STATUS.OK, BILL_MESSAGES.GET_ALL);
});

const getBillById = asyncHandler(async (req, res) => {
  const { billId } = req.params;
  const companyId = req.user.companyId;
  const bill = await getBillByIdService(billId, companyId);
  successResponse(res, bill, HTTP_STATUS.OK, BILL_MESSAGES.GET_ONE);
});

const updateBill = asyncHandler(async (req, res) => {
  const { billId } = req.params;
  const companyId = req.user.companyId;
  const updatedBill = await updateBillService(billId, req.body, companyId);
  successResponse(res, updatedBill, HTTP_STATUS.OK, BILL_MESSAGES.UPDATE);
});

const deleteBill = asyncHandler(async (req, res) => {
  const { billId } = req.params;
  const companyId = req.user.companyId;
  const result = await deleteBillService(billId, companyId);
  successResponse(res, result, HTTP_STATUS.OK, BILL_MESSAGES.DELETE);
});

const updateBillStatus = asyncHandler(async (req, res) => {
  const { billId } = req.params;
  const { status } = req.body;
  const companyId = req.user.companyId;
  const updatedBill = await updateBillStatusService(billId, status, companyId);
  successResponse(res, updatedBill, HTTP_STATUS.OK, BILL_MESSAGES.STATUS_UPDATE);
});

const getBillsStats = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;
  const stats = await getBillsStatsService(companyId);
  successResponse(res, stats, HTTP_STATUS.OK, BILL_MESSAGES.STATS);
});

export {
  createBill,
  getBills,
  getBillById,
  updateBill,
  deleteBill,
  updateBillStatus,
  getBillsStats,
};
