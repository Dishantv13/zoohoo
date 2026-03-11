import { Item } from "../model/item.model.js";
import { Vendor } from "../model/vendor.model.js";
import ApiError from "../util/apiError.js";

const resolveVendorContext = async (user, vendorIdInput) => {
  if (user?.role === "vendor") {
    return {
      vendorId: user._id,
      companyId: user.companyId,
    };
  }

  if (user?.role === "admin") {
    if (!vendorIdInput) {
      throw new ApiError(400, "vendorId is required for admin operations");
    }

    const vendor = await Vendor.findOne({
      _id: vendorIdInput,
      companyId: user.companyId,
    });

    if (!vendor) {
      throw new ApiError(404, "Vendor not found in your company");
    }

    return {
      vendorId: vendor._id,
      companyId: user.companyId,
    };
  }

  throw new ApiError(403, "Not authorized");
};

const createInventoryItemService = async (user, payload) => {
  const { vendorId: vendorIdInput, name, quantity, rate, tax, isActive } = payload;

  if (!name || quantity === undefined || rate === undefined) {
    throw new ApiError(400, "name, quantity and rate are required");
  }

  const { vendorId, companyId } = await resolveVendorContext(user, vendorIdInput);

  const item = await Item.create({
    name,
    quantity: Number(quantity),
    rate: Number(rate),
    tax: Number(tax) || 0,
    vendorId,
    companyId,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  });

  return item;
};

const getInventoryItemsService = async (user, query) => {
  const { vendorId: vendorIdInput, activeOnly } = query;
  const { vendorId, companyId } = await resolveVendorContext(user, vendorIdInput);

  const filters = { vendorId, companyId };

  if (String(activeOnly) === "true") {
    filters.isActive = true;
  }

  const items = await Item.find(filters).sort({ createdAt: -1 });
  return items;
};

const updateInventoryItemService = async (user, itemId, payload) => {
  const item = await Item.findById(itemId);
  if (!item) {
    throw new ApiError(404, "Inventory item not found");
  }

  const isVendorOwner =
    user?.role === "vendor" &&
    item.vendorId?.toString() === user._id?.toString() &&
    item.companyId?.toString() === user.companyId?.toString();

  const isAdminOwner =
    user?.role === "admin" &&
    item.companyId?.toString() === user.companyId?.toString();

  if (!isVendorOwner && !isAdminOwner) {
    throw new ApiError(403, "Not authorized to update this inventory item");
  }

  const updatable = ["name", "quantity", "rate", "tax", "isActive"];
  updatable.forEach((key) => {
    if (payload[key] !== undefined) {
      item[key] = key === "name" ? payload[key] : Number(payload[key]);
    }
  });

  if (payload.isActive !== undefined) {
    item.isActive = Boolean(payload.isActive);
  }

  await item.save();
  return item;
};

const deleteInventoryItemService = async (user, itemId) => {
  const item = await Item.findById(itemId);
  if (!item) {
    throw new ApiError(404, "Inventory item not found");
  }

  const isVendorOwner =
    user?.role === "vendor" &&
    item.vendorId?.toString() === user._id?.toString() &&
    item.companyId?.toString() === user.companyId?.toString();

  const isAdminOwner =
    user?.role === "admin" &&
    item.companyId?.toString() === user.companyId?.toString();

  if (!isVendorOwner && !isAdminOwner) {
    throw new ApiError(403, "Not authorized to delete this inventory item");
  }

  await Item.findByIdAndDelete(itemId);
  return { message: "Inventory item deleted successfully" };
};

const getVendorAvailabilityService = async (user, vendorId) => {
  if (user?.role !== "admin") {
    throw new ApiError(403, "Admin access only");
  }

  const vendor = await Vendor.findOne({ _id: vendorId, companyId: user.companyId });
  if (!vendor) {
    throw new ApiError(404, "Vendor not found in your company");
  }

  const items = await Item.find({
    vendorId,
    companyId: user.companyId,
    isActive: true,
  }).sort({ name: 1 });

  return items.map((item) => ({
    _id: item._id,
    name: item.name,
    quantity: item.quantity,
    rate: item.rate,
    tax: item.tax,
    isAvailable: Number(item.quantity) > 0,
  }));
};

export {
  createInventoryItemService,
  getInventoryItemsService,
  updateInventoryItemService,
  deleteInventoryItemService,
  getVendorAvailabilityService,
};
