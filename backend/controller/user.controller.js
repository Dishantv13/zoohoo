import {
  loginService,
  registerService,
  adminRegisterService,
  createCustomerService,
  getCompanyCustomersService,
  updateCustomerService,
  deleteCustomerService,
  getCurrentUserProfileService,
  updateUserProfileService,
  deleteProfileService,
  changePasswordService,
  logOutService,
} from "../service/user.services.js";

import ApiError from "../util/apiError.js";
import ApiResponse from "../util/apiResponse.js";

const register = async (req, res) => {
  try {
    const result = await registerService(req.body);
    if (result.success) {
      res
        .status(201)
        .json(
            new ApiResponse(
                201, 
                "User registered successfully", 
                result
            ));
    } else {
      res.status(400).json(new ApiError(400, result.message));
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json(new ApiError(500, "Server error"));
  }
};

const login = async (req, res) => {
  try {
    const result = await loginService(req.body);
    if (result.success) {
      res
        .status(200)
        .json(
          new ApiResponse(
            200, 
            "Login successful", 
            result
          ));
    } else {
      res.status(401).json(new ApiError(401, result.message));
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json(new ApiError(500, "Server error"));
  }
};

const getCurrentUserProfile = async (req, res) => {
  try {
    const user = await getCurrentUserProfileService(req.user._id);
    res
      .status(200)
      .json(
        new ApiResponse(
            200, 
            "User profile retrieved", 
            user
        ));
  } catch (error) {
    res.status(404).json(new ApiError(404, error.message));
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const updatedUser = await updateUserProfileService(req.user._id, req.body);
    res
      .status(200)
      .json(
        new ApiResponse(
            200, 
            "User profile updated", 
            updatedUser
        ));
  } catch (error) {
    res.status(400).json(new ApiError(400, error.message));
  }
};

const deleteProfile = async (req, res) => {
  try {
    await deleteProfileService(req.user._id);
    res
      .status(200)
      .json(
        new ApiResponse(
            200, 
            "Account deleted", 
            null
        ));
  } catch (error) {
    res.status(400).json(new ApiError(400, error.message));
  }
};

const changePassword = async (req, res) => {
  try {
    const result = await changePasswordService(req.user._id, req.body);
    if (result.success) {
      res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                "Password updated successfully", 
                null
            ));
    } else {
      res
        .status(400)
        .json(
            new ApiError(400, result.message));
    }
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json(new ApiError(500, "Error updating password"));
  }
};

const logout = async (req, res) => {
  try {
    const result = await logOutService(req.user._id);
    if (result.success) {
      res
        .status(200)
        .json(
          new ApiResponse(
            200, 
            "Logout successful", 
            null
          ));
    } else {
      res
        .status(400)
        .json(new ApiError(400, result.message));
    }
  } catch (error) {
    console.error("Logout error:", error);
    res
      .status(500)
      .json(new ApiError(500, error.message || "Error logging out"));
  }
};

const adminRegister = async (req, res) => {
  try {
    const result = await adminRegisterService(req.body);
    if (result.success) {
      res
        .status(201)
        .json(
            new ApiResponse(
                201, 
                "Admin registered successfully", 
                result
            ));
    } else {
      res.status(400).json(new ApiError(400, result.message));
    }
  } catch (error) {
    console.error("Admin registration error:", error);
    res.status(500).json(new ApiError(500, error.message));
  }
};

const createCustomer = async (req, res) => {
  try {
    const customer = await createCustomerService(req.user._id, req.body);
    res
      .status(201)
      .json(
        new ApiResponse(
            201, 
            "Customer created successfully", 
            customer
        ));
  } catch (error) {
    res.status(400).json(new ApiError(400, error.message));
  }
};

const getCompanyCustomers = async (req, res) => {
  try {
    const customers = await getCompanyCustomersService(req.user._id, {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      status: req.query.status,
    });
    res
      .status(200)
      .json(
        new ApiResponse(
            200, 
            "Customers retrieved", 
            customers
        ));
  } catch (error) {
    res.status(404).json(new ApiError(404, error.message));
  }
};

const updateCustomer = async (req, res) => {
  try {
    const updatedCustomer = await updateCustomerService(
      req.user._id,
      req.params.customerId,
      req.body,
    );
    res
      .status(200)
      .json(
        new ApiResponse(
            200, 
            "Customer updated successfully", 
            updatedCustomer
        ));
  } catch (error) {
    res.status(400).json(new ApiError(400, error.message));
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const result = await deleteCustomerService(
      req.user._id,
      req.params.customerId,
    );
    res
      .status(200)
      .json(
        new ApiResponse(
            200, 
            "Customer deleted successfully", 
            result
        ));
  } catch (error) {
    res.status(400).json(new ApiError(400, error.message));
  }
};

export {
  register,
  login,
  logout,
  adminRegister,
  createCustomer,
  getCompanyCustomers,
  updateCustomer,
  deleteCustomer,
  getCurrentUserProfile,
  updateUserProfile,
  deleteProfile,
  changePassword,
};
