import {User} from "../model/user.model.js";

const createCustomer = async (req, res) => {
    console.log('REQ BODY:', req.body); 
    const customer = await User.create(req.body);
    res.status(201).json(customer);
}

const getCustomer = async (req,res) => {
    const customers = await User.find();
    res.json(customers);
}


const getCustomerById = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { name, email, phonenumber } = req.body;

    const customer = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phonenumber },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const customer = await User.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
    createCustomer,
    getCustomer,
    getCustomerById,
    deleteCustomer,
    updateCustomer
}