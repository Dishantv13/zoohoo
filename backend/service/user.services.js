import { User } from "../model/user.model.js";
import { Company } from "../model/company.model.js";
import { Vendor } from "../model/vendor.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AUTH_ERRORS } from "../util/errorMessage.js";

const registerService = async (userData) => {
  const { name, email, password, phonenumber, address } = userData;

  if (!name || !email || !password) {
    throw AUTH_ERRORS.REQUIRED_REGISTER_FIELDS();
  }
  const userExists = await User.findOne({ email: email.toLowerCase() });

  if (userExists) {
    throw AUTH_ERRORS.USER_ALREADY_EXISTS();
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phonenumber,
    address,
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      address: user.address,
    },
  };
};

const adminRegisterService = async (userData) => {
  const {
    adminName,
    adminEmail,
    adminPassword,
    adminPhone,
    companyName,
    companyEmail,
    companyPhone,
    companyAddress,
    city,
    state,
    zipcode,
    country,
    website,
    industry,
    gstNumber,
    panNumber,
  } = userData;

  if (
    !adminName ||
    !adminEmail ||
    !adminPhone ||
    !adminPassword ||
    !companyName ||
    !companyAddress ||
    !companyEmail ||
    !companyPhone
  ) {
    throw AUTH_ERRORS.REQUIRED_ADMIN_FIELDS();
  }

  const adminExists = await User.findOne({ email: adminEmail.toLowerCase() });
  if (adminExists) {
    throw AUTH_ERRORS.ADMIN_EMAIL_EXISTS();
  }

  const companyExists = await Company.findOne({
    email: companyEmail.toLowerCase(),
  });
  if (companyExists) {
    throw AUTH_ERRORS.COMPANY_EMAIL_EXISTS();
  }

  const admin = await User.create({
    name: adminName,
    email: adminEmail.toLowerCase(),
    password: adminPassword,
    phonenumber: adminPhone,
    role: "admin",
  });

  const company = await Company.create({
    name: companyName,
    email: companyEmail.toLowerCase(),
    phonenumber: companyPhone,
    address: companyAddress,
    city,
    state,
    zipcode,
    country,
    website,
    industry,
    gstNumber,
    panNumber,
    adminId: admin._id,
  });

  admin.companyId = company._id;
  await admin.save();

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return {
    token,
    user: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      companyId: company._id,
    },
    company: {
      id: company._id,
      name: company.name,
      email: company.email,
      address: company.address,
    },
  };
};

const loginService = async ({ email, password }) => {
  if (!email || !password) {
    throw AUTH_ERRORS.EMAIL_PASSWORD_REQUIRED();
  }

  const normalizedEmail = email.toLowerCase();

  let user = await User.findOne({ email: normalizedEmail })
    .select("+password")
    .populate("companyId");

  if (user) {
    if (!user.isActive) {
      throw AUTH_ERRORS.ACCOUNT_DEACTIVATED();
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      throw AUTH_ERRORS.INVALID_CREDENTIALS();
    }

    const token = jwt.sign(
      { id: user._id, accountType: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId?._id,
        company: user.companyId,
        accountType: "user",
      },
    };
  }

  const vendor = await Vendor.findOne({ email: normalizedEmail });

  if (!vendor) {
    throw AUTH_ERRORS.INVALID_CREDENTIALS();
  }

  const isPasswordValid = await bcrypt.compare(password, vendor.password);

  if (!isPasswordValid) {
    throw AUTH_ERRORS.INVALID_CREDENTIALS();
  }

  const vendorObj = vendor.toObject();
  delete vendorObj.password;

  const token = jwt.sign(
    { id: vendor._id, accountType: "vendor" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  return {
    token,
    user: {
      ...vendorObj,
      role: "vendor",
      id: vendor._id,
      accountType: "vendor",
    },
  };
};

const logOutService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw AUTH_ERRORS.USER_NOT_FOUND();
  }

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  };
};

const getCurrentUserProfileService = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw AUTH_ERRORS.USER_NOT_FOUND();
  }

  return user;
};

const updateUserProfileService = async (userId, updateData) => {
  const { name, email, phonenumber, address } = updateData;

  const user = await User.findByIdAndUpdate(
    userId,
    { name, email, phonenumber, address },
    { new: true, runValidators: true },
  ).select("-password");

  if (!user) {
    throw AUTH_ERRORS.USER_NOT_FOUND();
  }

  return user;
};

const deleteProfileService = async (userId) => {
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw AUTH_ERRORS.USER_NOT_FOUND();
  }

  return null;
};

const getCompanyCustomersService = async (adminId, options = {}) => {
  const admin = await User.findById(adminId);

  const page = Math.max(parseInt(options.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(options.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;
  const search = options.search || "";
  const status = options.status || "all";

  if (!admin || admin.role !== "admin") {
    throw AUTH_ERRORS.ADMIN_ONLY_ACCESS();
  }

  const query = {
    companyId: admin.companyId,
    role: "customer",
  };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (status === "active") {
    query.isActive = true;
  } else if (status === "inactive") {
    query.isActive = false;
  }

  const customers = await User.find(query)
    .select("-password")
    .skip(skip)
    .limit(limit);

  const totalCustomers = await User.countDocuments(query);

  const totalPages =
    totalCustomers === 0 ? 0 : Math.ceil(totalCustomers / limit);

  return {
    customers,
    pagination: {
      page,
      limit,
      totalCustomers,
      totalPages,
      hasNext: totalPages > 0 && page < totalPages,
      hasPrev: page > 1 && totalPages > 0,
    },
  };
};

const createCustomerService = async (adminId, customerData) => {
  const { name, email, password, phonenumber } = customerData;

  if (!name || !email || !password) {
    throw AUTH_ERRORS.REQUIRED_REGISTER_FIELDS();
  }

  const admin = await User.findById(adminId);
  if (!admin || admin.role !== "admin") {
    throw AUTH_ERRORS.ADMIN_ONLY_ACCESS();
  }

  const customerExists = await User.findOne({
    email: email.toLowerCase(),
    companyId: admin.companyId,
  });
  if (customerExists) {
    throw AUTH_ERRORS.EMAIL_ALREADY_REGISTERED();
  }

  const customer = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phonenumber,
    role: "customer",
    companyId: admin.companyId,
    isActive: true,
  });

  return {
    id: customer._id,
    name: customer.name,
    email: customer.email,
    phonenumber: customer.phonenumber,
    role: customer.role,
    isActive: customer.isActive,
  };
};

const updateCustomerService = async (adminId, customerId, updateData) => {
  const admin = await User.findById(adminId);
  if (!admin || admin.role !== "admin") {
    throw AUTH_ERRORS.ADMIN_ONLY_ACCESS();
  }

  const customer = await User.findById(customerId);
  if (
    !customer ||
    customer.companyId.toString() !== admin.companyId.toString()
  ) {
    throw AUTH_ERRORS.CUSTOMER_NOT_FOUND();
  }

  const { name, phonenumber, isActive } = updateData;

  const updatedCustomer = await User.findByIdAndUpdate(
    customerId,
    { name, phonenumber, isActive },
    { new: true, runValidators: true },
  ).select("-password");

  return updatedCustomer;
};

const deleteCustomerService = async (adminId, customerId) => {
  const admin = await User.findById(adminId);
  if (!admin || admin.role !== "admin") {
    throw AUTH_ERRORS.ADMIN_ONLY_ACCESS();
  }

  const customer = await User.findById(customerId);
  if (
    !customer ||
    customer.companyId.toString() !== admin.companyId.toString()
  ) {
    throw AUTH_ERRORS.CUSTOMER_NOT_FOUND();
  }

  await User.findByIdAndDelete(customerId);

  return null;
};

const changePasswordService = async (userId, data) => {
  const { currentPassword, newPassword } = data;

  if (!currentPassword || !newPassword) {
    throw AUTH_ERRORS.PASSWORD_REQUIRED();
  }

  if (newPassword.length < 6) {
    throw AUTH_ERRORS.PASSWORD_MIN_LENGTH();
  }

  if (currentPassword === newPassword) {
    throw AUTH_ERRORS.PASSWORD_SAME_AS_OLD();
  }

  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw AUTH_ERRORS.USER_NOT_FOUND();
  }

  const isPasswordMatch = await user.matchPassword(currentPassword);

  if (!isPasswordMatch) {
    throw AUTH_ERRORS.CURRENT_PASSWORD_INCORRECT();
  }

  user.password = newPassword;
  await user.save();

  return null;
};

export {
  registerService,
  adminRegisterService,
  loginService,
  logOutService,
  getCurrentUserProfileService,
  updateUserProfileService,
  deleteProfileService,
  getCompanyCustomersService,
  createCustomerService,
  updateCustomerService,
  deleteCustomerService,
  changePasswordService,
};
