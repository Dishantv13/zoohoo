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

const createVendor = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;
  const result = await createVendorService(req.body, companyId);
  successResponse(res, result, 201, "Vendor created successfully");
});

const getVendors = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;
  const options = {
    page: req.query.page,
    limit: req.query.limit,
  };
  const vendors = await getVendorsService(companyId, options);
  successResponse(res, vendors, 200, "Vendors retrieved successfully");
});

const getVendorById = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const companyId = req.user.companyId;
  const vendor = await getVendorByIdService(vendorId, companyId);
  successResponse(res, vendor, 200, "Vendor retrieved successfully");
});

const updateVendor = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const companyId = req.user.companyId;
  const updatedVendor = await updateVendorService(vendorId, req.body, companyId);
  successResponse(res, updatedVendor, 200, "Vendor updated successfully");
});

const deleteVendor = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const companyId = req.user.companyId;
  const result = await deleteVendorService(vendorId, companyId);
  successResponse(res, result, 200, "Vendor deleted successfully");
});

const getVendorBills = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const companyId = req.user.companyId;
  const bills = await getVendorBillsService(vendorId, companyId);
  successResponse(res, bills, 200, "Vendor bills retrieved successfully");
});

const getVendorStats = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const companyId = req.user.companyId;
  const stats = await getVendorStatsService(vendorId, companyId);
  successResponse(res, stats, 200, "Vendor statistics retrieved successfully");
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
