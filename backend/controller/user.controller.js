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
} from "../service/user.services.js";

const register = async (req, res) => {
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

// const createCustomer = async (req, res) => {
//   try {
//     const customer = await createCustomerService(req.body);
//     res.status(201).json(customer);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

const getCurrentUserProfile = async (req, res) => {
  try {
    const user = await getCurrentUserProfileService(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// const getCustomer = async (req, res) => {
//   try {
//     const customers = await getCustomerService();
//     res.json(customers);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

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
      req.body
    );
    res.json(updatedCustomer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const result = await deleteCustomerService(req.user._id, req.params.customerId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export {
  register,
  login,
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
