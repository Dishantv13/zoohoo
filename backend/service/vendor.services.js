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

const getVendorsService = async (companyId) => {
  const vendors = await Vendor.find({ companyId }).select("-password");
  return vendors;
};

const getVendorByIdService = async (vendorId, companyId) => {
  const vendor = await Vendor.findOne({ 
    _id: vendorId, 
    companyId 
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
      "Cannot delete vendor with existing bills. Please delete or reassign bills first."
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

  const bills = await Bill.find({ vendorId });

  const totalPurchases = bills.length;
  const totalAmount = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const paidAmount = bills
    .filter((bill) => bill.status === "PAID")
    .reduce((sum, bill) => sum + bill.totalAmount, 0);
  const pendingAmount = bills
    .filter((bill) => bill.status === "PENDING")
    .reduce((sum, bill) => sum + bill.totalAmount, 0);
  const partiallyPaidAmount = bills
    .filter((bill) => bill.status === "PARTIALLY_PAID")
    .reduce((sum, bill) => sum + bill.totalAmount, 0);

  return {
    vendor: {
      id: vendor._id,
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
    },
    statistics: {
      totalPurchases,
      totalAmount,
      paidAmount,
      pendingAmount,
      partiallyPaidAmount,
      outstandingAmount: pendingAmount + partiallyPaidAmount,
    },
  };
};

const authenticateVendorService = async (email, password, companyId) => {
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const vendor = await Vendor.findOne({
    email: email.toLowerCase(),
    companyId,
  });

  if (!vendor) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, vendor.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const vendorObj = vendor.toObject();
  delete vendorObj.password;
  return vendorObj;
};

export {
  createVendorService,
  getVendorsService,
  getVendorByIdService,
  updateVendorService,
  deleteVendorService,
  getVendorBillsService,
  getVendorStatsService,
  authenticateVendorService,
};
