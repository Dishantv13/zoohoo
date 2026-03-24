import { Vendor } from "../model/vendor.model.js";
import { Bill } from "../model/bill.model.js";
import bcrypt from "bcryptjs";
import { VENDOR_ERRORS } from "../util/errorMessage.js";
import { getPagination, getPaginationMeta } from "../util/pagination.js";

const createVendorService = async (vendorData, companyId) => {
  const { name, email, phone, password, address } = vendorData;

  if (!name || !email || !password) {
    throw VENDOR_ERRORS.REQUIRED_FIELDS();
  }

  const existingVendor = await Vendor.findOne({
    email: email.toLowerCase(),
    companyId,
  });

  if (existingVendor) {
    throw VENDOR_ERRORS.VENDOR_ALREADY_EXISTS();
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
  const { page, limit, skip } = getPagination({
    page: options.page,
    limit: options.limit,
    skip: options.skip,
  });

  const vendors = await Vendor.find({ companyId })
    .select("-password")
    .skip(skip)
    .limit(limit);

  const totalVendors = await Vendor.countDocuments({ companyId });

  return {
    vendors,
    pagination: getPaginationMeta(totalVendors, page, limit),
  };
};

const getVendorByIdService = async (vendorId, companyId) => {
  const vendor = await Vendor.findOne({
    _id: vendorId,
    companyId,
  }).select("-password");

  if (!vendor) {
    throw VENDOR_ERRORS.VENDOR_NOT_FOUND();
  }

  return vendor;
};

const updateVendorService = async (vendorId, vendorData, companyId) => {
  const vendor = await Vendor.findOne({ _id: vendorId, companyId });

  if (!vendor) {
    throw VENDOR_ERRORS.VENDOR_NOT_FOUND();
  }

  const { name, email, phone, address, password } = vendorData;

  if (email && email !== vendor.email) {
    const existingVendor = await Vendor.findOne({
      email: email.toLowerCase(),
      companyId,
      _id: { $ne: vendorId },
    });

    if (existingVendor) {
      throw VENDOR_ERRORS.VENDOR_ALREADY_EXISTS();
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
    throw VENDOR_ERRORS.VENDOR_NOT_FOUND();
  }

  const billCount = await Bill.countDocuments({ vendorId });
  if (billCount > 0) {
    throw VENDOR_ERRORS.VENDOR_DELETE_WITH_BILLS();
  }

  await Vendor.findByIdAndDelete(vendorId);
  return { message: "Vendor deleted successfully" };
};

const getVendorBillsService = async (vendorId, companyId) => {
  const vendor = await Vendor.findOne({ _id: vendorId, companyId });

  if (!vendor) {
    throw VENDOR_ERRORS.VENDOR_NOT_FOUND();
  }

  const bills = await Bill.find({ vendorId })
    .populate("items.itemId", "name")
    .sort({ createdAt: -1 });

  return bills;
};

const getVendorStatsService = async (vendorId, companyId) => {
  const vendor = await Vendor.findOne({ _id: vendorId, companyId });

  if (!vendor) {
    throw VENDOR_ERRORS.VENDOR_NOT_FOUND();
  }

  const statistics = await Bill.aggregate([
    { $match: { vendorId: vendor._id } },
    {
      $group: {
        _id: vendor._id,
        totalAmount: { $sum: "$totalAmount" },
        paidAmount: { $sum: "$amountPaid" },
        pendingAmount: { $sum: "$remainingAmount" },
        overdueCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lt: ["$dueDate", new Date()] },
                  { $ne: ["$status", "PAID"] },
                ],
              },
              1,
              0,
            ],
          },
        },
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
      overdueCount: 0,
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
