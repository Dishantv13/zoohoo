import {
  createInventoryItemService,
  getInventoryItemsService,
  updateInventoryItemService,
  deleteInventoryItemService,
  getVendorAvailabilityService,
} from "../service/item.services.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { successResponse } from "../util/response.js";

const createInventoryItem = asyncHandler(async (req, res) => {
  const item = await createInventoryItemService(req.user, req.body);
  successResponse(res, item, 201, "Inventory item created successfully");
});

const getInventoryItems = asyncHandler(async (req, res) => {
  const items = await getInventoryItemsService(req.user, req.query);
  successResponse(res, items, 200, "Inventory items retrieved successfully");
});

const updateInventoryItem = asyncHandler(async (req, res) => {
  const item = await updateInventoryItemService(req.user, req.params.itemId, req.body);
  successResponse(res, item, 200, "Inventory item updated successfully");
});

const deleteInventoryItem = asyncHandler(async (req, res) => {
  const result = await deleteInventoryItemService(req.user, req.params.itemId);
  successResponse(res, result, 200, "Inventory item deleted successfully");
});

const getVendorAvailability = asyncHandler(async (req, res) => {
  const items = await getVendorAvailabilityService(req.user, req.params.vendorId);
  successResponse(res, items, 200, "Vendor availability retrieved successfully");
});

export {
  createInventoryItem,
  getInventoryItems,
  updateInventoryItem,
  deleteInventoryItem,
  getVendorAvailability,
};
