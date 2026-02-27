import {
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
} from "../service/user.services.js";

import { asyncHandler } from "../util/asyncHandler.js";
import { successResponse } from "../util/response.js";

const register = asyncHandler(async (req, res) => {
  const result = await registerService(req.body);
  successResponse(res, result, 201, "User registered successfully");
});

const adminRegister = asyncHandler(async (req, res) => {
  const result = await adminRegisterService(req.body);
  successResponse(res, result, 201, "Admin registered successfully");
});

const login = asyncHandler(async (req, res) => {
  const result = await loginService(req.body);
  successResponse(res, result, 200, "User Login successful");
});

const logout = asyncHandler(async (req, res) => {
  const result = await logOutService(req.user._id);

  successResponse(res, null, 200, "User logged out successfully");
});

const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await getCurrentUserProfileService(req.user._id);
  successResponse(res, user, 200, "User profile retrieved successfully");
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const updatedUser = await updateUserProfileService(req.user._id, req.body);

  successResponse(res, updatedUser, 200, "User profile Updated successfully");
});

const deleteProfile = asyncHandler(async (req, res) => {
  await deleteProfileService(req.user._id);
  successResponse(res, null, 200, "user profile deleted successfully");
});

const getCompanyCustomers = asyncHandler(async (req, res) => {
  const customers = await getCompanyCustomersService(req.user._id, {
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    status: req.query.status,
  });
  successResponse(res, customers, 200, "customer retrieved successfully");
});

const createCustomer = asyncHandler(async (req, res) => {
  const customer = await createCustomerService(req.user._id, req.body);
  successResponse(res, customer, 201, "Customer created successfully");
});

const updateCustomer = asyncHandler(async (req, res) => {
  const updatedCustomer = await updateCustomerService(
    req.user._id,
    req.params.customerId,
    req.body,
  );
  successResponse(res, updatedCustomer, 200, "Customer updated successfully");
});

const deleteCustomer = asyncHandler(async (req, res) => {
  const result = await deleteCustomerService(
    req.user._id,
    req.params.customerId,
  );
  successResponse(res, null, 200, "Customer deleted successfully");
});

const changePassword = asyncHandler(async (req, res) => {
  await changePasswordService(req.user._id, req.body);
  successResponse(res, null, 200, "Password changed successfully");
});

export {
  register,
  adminRegister,
  login,
  logout,
  getCurrentUserProfile,
  updateUserProfile,
  deleteProfile,
  getCompanyCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  changePassword,
};
