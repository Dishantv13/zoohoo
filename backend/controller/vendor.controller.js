import {
  createVendorService,
  getVendorsService,
  getVendorByIdService,
  updateVendorService,
  deleteVendorService,
  getVendorBillsService,
  getVendorStatsService,
} from "../service/vendor.services.js";

import { asyncHandler } from "../util/asyncHandler.js";
import { successResponse } from "../util/response.js";
import { VENDOR_MESSAGES } from "../util/successMessge.js";
import { HTTP_STATUS } from "../util/httpStatus.js";

const createVendor = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;
  const result = await createVendorService(req.body, companyId);
  successResponse(res, result, HTTP_STATUS.CREATED, VENDOR_MESSAGES.CREATE);
});

const getVendors = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;
  const options = {
    page: req.query.page,
    limit: req.query.limit,
  };
  const vendors = await getVendorsService(companyId, options);
  successResponse(res, vendors, HTTP_STATUS.OK, VENDOR_MESSAGES.GET_ALL);
});

const getVendorById = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const companyId = req.user.companyId;
  const vendor = await getVendorByIdService(vendorId, companyId);
  successResponse(res, vendor, HTTP_STATUS.OK, VENDOR_MESSAGES.GET_ONE);
});

const updateVendor = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const companyId = req.user.companyId;
  const updatedVendor = await updateVendorService(vendorId, req.body, companyId);
  successResponse(res, updatedVendor, HTTP_STATUS.OK, VENDOR_MESSAGES.UPDATE);
});

const deleteVendor = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const companyId = req.user.companyId;
  const result = await deleteVendorService(vendorId, companyId);
  successResponse(res, result, HTTP_STATUS.OK, VENDOR_MESSAGES.DELETE);
});

const getVendorBills = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const companyId = req.user.companyId;
  const bills = await getVendorBillsService(vendorId, companyId);
  successResponse(res, bills, HTTP_STATUS.OK, VENDOR_MESSAGES.VENDOR_BILLS_RETRIEVED);
});

const getVendorStats = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const companyId = req.user.companyId;
  const stats = await getVendorStatsService(vendorId, companyId);
  successResponse(res, stats, HTTP_STATUS.OK, VENDOR_MESSAGES.VENDOR_STATS_RETRIEVED);
});

export {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  getVendorBills,
  getVendorStats,
};
