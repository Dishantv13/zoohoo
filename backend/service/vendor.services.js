import { Vendor } from "../model/vendor.model.js";
import { Bill } from "../model/bill.model.js";
import ApiError from "../util/apiError.js";
import bcrypt from "bcryptjs";

const createVendorService = async (vendorData, companyId) => {
  const { name, email, phone, password, address } = vendorData;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required");
  }

  const existingVendor = await Vendor.findOne({
    email: email.toLowerCase(),
    companyId,
  });

  if (existingVendor) {
    throw new ApiError(400, "A vendor with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const vendor = await Vendor.create({
    name,
    email: email.toLowerCase(),
    phone,
    password: hashedPassword,
    address,
    companyId,
  });

  const vendorObj = vendor.toObject();
  delete vendorObj.password;
  return vendorObj;
};

const getVendorsService = async (companyId, options = {}) => {
  const page = Math.max(parseInt(options.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(options.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const vendors = await Vendor.find({ companyId })
    .select("-password")
    .skip(skip)
    .limit(limit);

  const totalVendors = await Vendor.countDocuments({ companyId });
  const totalPages = Math.ceil(totalVendors / limit);

  return {
    vendors,
    pagination: {
      page,
      limit,
      totalVendors,
      totalPages,
      hasNext: totalPages > 0 && page < totalPages,
      hasPrev: page > 1 && totalPages > 0,
    },
  };
};

const getVendorByIdService = async (vendorId, companyId) => {
  const vendor = await Vendor.findOne({
    _id: vendorId,
    companyId,
  }).select("-password");

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  return vendor;
};

const updateVendorService = async (vendorId, vendorData, companyId) => {
  const vendor = await Vendor.findOne({ _id: vendorId, companyId });

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  const { name, email, phone, address, password } = vendorData;

  if (email && email !== vendor.email) {
    const existingVendor = await Vendor.findOne({
      email: email.toLowerCase(),
      companyId,
      _id: { $ne: vendorId },
    });

    if (existingVendor) {
      throw new ApiError(400, "A vendor with this email already exists");
    }
    vendor.email = email.toLowerCase();
  }

  if (name) vendor.name = name;
  if (phone !== undefined) vendor.phone = phone;
  if (address !== undefined) vendor.address = address;

  if (password) {
    vendor.password = await bcrypt.hash(password, 10);
  }

  await vendor.save();

  const vendorObj = vendor.toObject();
  delete vendorObj.password;
  return vendorObj;
};

const deleteVendorService = async (vendorId, companyId) => {
  const vendor = await Vendor.findOne({ _id: vendorId, companyId });

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  const billCount = await Bill.countDocuments({ vendorId });
  if (billCount > 0) {
    throw new ApiError(
      400,
      "Cannot delete vendor with existing bills. Please delete or reassign bills first.",
    );
  }

  await Vendor.findByIdAndDelete(vendorId);
  return { message: "Vendor deleted successfully" };
};

const getVendorBillsService = async (vendorId, companyId) => {
  const vendor = await Vendor.findOne({ _id: vendorId, companyId });

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  const bills = await Bill.find({ vendorId })
    .populate("items.itemId", "name")
    .sort({ createdAt: -1 });

  return bills;
};

const getVendorStatsService = async (vendorId, companyId) => {
  const vendor = await Vendor.findOne({ _id: vendorId, companyId });

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  const statistics = await Bill.aggregate([
    { $match: { vendorId: vendor._id } },
    {
      $group: {
        _id: vendor._id,
        totalAmount: { $sum: "$totalAmount" },
        paidAmount: { $sum: "$amountPaid" },
        pendingAmount: { $sum: "$remainingAmount" },
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    vendor: {
      id: vendor._id,
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
    },
    statistics: statistics[0] || {
      _id: null,
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      count: 0,
    },
  };
};

export {
  createVendorService,
  getVendorsService,
  getVendorByIdService,
  updateVendorService,
  deleteVendorService,
  getVendorBillsService,
  getVendorStatsService,
};
