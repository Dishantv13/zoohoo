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

const createBill = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;
  const result = await createBillService(req.body, companyId);
  successResponse(res, result, 201, "Bill created successfully");
});

const getBills = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;
  const { vendorId, status } = req.query;
  const filters = {};
  
  if (vendorId) filters.vendorId = vendorId;
  if (status) filters.status = status;
  
  const bills = await getBillsService(companyId, filters);
  successResponse(res, bills, 200, "Bills retrieved successfully");
});

const getBillById = asyncHandler(async (req, res) => {
  const { billId } = req.params;
  const companyId = req.user.companyId;
  const bill = await getBillByIdService(billId, companyId);
  successResponse(res, bill, 200, "Bill retrieved successfully");
});

const updateBill = asyncHandler(async (req, res) => {
  const { billId } = req.params;
  const companyId = req.user.companyId;
  const updatedBill = await updateBillService(billId, req.body, companyId);
  successResponse(res, updatedBill, 200, "Bill updated successfully");
});

const deleteBill = asyncHandler(async (req, res) => {
  const { billId } = req.params;
  const companyId = req.user.companyId;
  const result = await deleteBillService(billId, companyId);
  successResponse(res, result, 200, "Bill deleted successfully");
});

const updateBillStatus = asyncHandler(async (req, res) => {
  const { billId } = req.params;
  const { status } = req.body;
  const companyId = req.user.companyId;
  const updatedBill = await updateBillStatusService(billId, status, companyId);
  successResponse(res, updatedBill, 200, "Bill status updated successfully");
});

const getBillsStats = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;
  const stats = await getBillsStatsService(companyId);
  successResponse(res, stats, 200, "Bills statistics retrieved successfully");
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
