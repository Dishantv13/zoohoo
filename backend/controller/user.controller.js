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

const register = async (req, res) => {
  console.log("Received registration data:", req.body);
  try {
    const result = await registerService(req.body);
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const result = await loginService(req.body);
    if (result.success) {
      res.status(200).json({
        message: result.message,
        token: result.token,
        user: result.user,
      });
    } else {
      res.status(401).json({ message: result.message });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getCurrentUserProfile = async (req, res) => {
  try {
    const user = await getCurrentUserProfileService(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const updatedUser = await updateUserProfileService(req.user._id, req.body);
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteProfile = async (req, res) => {
  try {
    await deleteProfileService(req.user._id);
    res.json({ message: "Account deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const result = await changePasswordService(req.user._id, req.body);
    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Error updating password" });
  }
};

const logout = async (req, res) => {
  try {
    const result = await logOutService(req.user._id);
    if (result.success) {
      res.status(200).json({
        success: result.success,
        message: result.message,
        user: result.user,
      });
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: error.message || "Error logging out" });
  }
};

const adminRegister = async (req, res) => {
  try {
    const result = await adminRegisterService(req.body);
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error("Admin registration error:", error);
    res.status(500).json({ message: error.message });
  }
};

const createCustomer = async (req, res) => {
  try {
    const customer = await createCustomerService(req.user._id, req.body);
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    res.status(200).json(customers);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const updatedCustomer = await updateCustomerService(
      req.user._id,
      req.params.customerId,
      req.body,
    );
    res.status(200).json(updatedCustomer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const result = await deleteCustomerService(
      req.user._id,
      req.params.customerId,
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
