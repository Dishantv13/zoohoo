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
import { USER_MESSAGES } from "../util/successMessge.js";
import { HTTP_STATUS } from "../util/httpStatus.js";

const register = asyncHandler(async (req, res) => {
  const result = await registerService(req.body);
  successResponse(res, result, HTTP_STATUS.CREATED, USER_MESSAGES.REGISTER);
});

const adminRegister = asyncHandler(async (req, res) => {
  const result = await adminRegisterService(req.body);
  successResponse(res, result, HTTP_STATUS.CREATED, USER_MESSAGES.ADMIN_REGISTER);
});

const login = asyncHandler(async (req, res) => {
  const result = await loginService(req.body);
  successResponse(res, result, HTTP_STATUS.OK, USER_MESSAGES.LOGIN);
});

const logout = asyncHandler(async (req, res) => {
  const result = await logOutService(req.user._id);

  successResponse(res, null, HTTP_STATUS.OK, USER_MESSAGES.LOGOUT);
});

const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await getCurrentUserProfileService(req.user._id);
  successResponse(res, user, HTTP_STATUS.OK, USER_MESSAGES.PROFILE_RETRIEVED);
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const updatedUser = await updateUserProfileService(req.user._id, req.body);

  successResponse(res, updatedUser, HTTP_STATUS.OK, USER_MESSAGES.PROFILE_UPDATED);
});

const deleteProfile = asyncHandler(async (req, res) => {
  await deleteProfileService(req.user._id);
  successResponse(res, null, HTTP_STATUS.OK, USER_MESSAGES.PROFILE_DELETED);
});

const getCompanyCustomers = asyncHandler(async (req, res) => {
  const customers = await getCompanyCustomersService(req.user._id, {
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    status: req.query.status,
  });
  successResponse(res, customers, HTTP_STATUS.OK, USER_MESSAGES.CUSTOMERS_RETRIEVED);
});

const createCustomer = asyncHandler(async (req, res) => {
  const customer = await createCustomerService(req.user._id, req.body);
  successResponse(res, customer, HTTP_STATUS.CREATED, USER_MESSAGES.CUSTOMER_CREATED);
});

const updateCustomer = asyncHandler(async (req, res) => {
  const updatedCustomer = await updateCustomerService(
    req.user._id,
    req.params.customerId,
    req.body,
  );
  successResponse(res, updatedCustomer, HTTP_STATUS.OK, USER_MESSAGES.CUSTOMER_UPDATED);
});

const deleteCustomer = asyncHandler(async (req, res) => {
  const result = await deleteCustomerService(
    req.user._id,
    req.params.customerId,
  );
  successResponse(res, null, HTTP_STATUS.OK, USER_MESSAGES.CUSTOMER_DELETED);
});

const changePassword = asyncHandler(async (req, res) => {
  await changePasswordService(req.user._id, req.body);
  successResponse(res, null, HTTP_STATUS.OK, USER_MESSAGES.PASSWORD_CHANGE_SUCCESS);
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
