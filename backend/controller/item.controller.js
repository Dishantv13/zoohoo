import {
  createInventoryItemService,
  getInventoryItemsService,
  updateInventoryItemService,
  deleteInventoryItemService,
  getVendorAvailabilityService,
} from "../service/item.services.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { successResponse } from "../util/response.js";
import { ITEM_MESSAGE } from "../util/successMessge.js";
import { HTTP_STATUS } from "../util/httpStatus.js";

const createInventoryItem = asyncHandler(async (req, res) => {
  const item = await createInventoryItemService(req.user, req.body);
  successResponse(res, item, HTTP_STATUS.CREATED, ITEM_MESSAGE.CREATE);
});

const getInventoryItems = asyncHandler(async (req, res) => {
  const items = await getInventoryItemsService(req.user, req.query);
  successResponse(res, items, HTTP_STATUS.OK, ITEM_MESSAGE.GET_ALL);
});

const updateInventoryItem = asyncHandler(async (req, res) => {
  const item = await updateInventoryItemService(req.user, req.params.itemId, req.body);
  successResponse(res, item, HTTP_STATUS.OK, ITEM_MESSAGE.UPDATE);
});

const deleteInventoryItem = asyncHandler(async (req, res) => {
  const result = await deleteInventoryItemService(req.user, req.params.itemId);
  successResponse(res, result, HTTP_STATUS.OK, ITEM_MESSAGE.DELETE);
});

const getVendorAvailability = asyncHandler(async (req, res) => {
  const items = await getVendorAvailabilityService(req.user, req.params.vendorId);
  successResponse(res, items, HTTP_STATUS.OK, ITEM_MESSAGE.VENDOR_AVAILABILITY);
});

export {
  createInventoryItem,
  getInventoryItems,
  updateInventoryItem,
  deleteInventoryItem,
  getVendorAvailability,
};
