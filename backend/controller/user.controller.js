    import {User} from "../model/user.model.js";
    import jwt from "jsonwebtoken";

    const generateToken = (id) => {
        return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE || '7d'
        });
    };


    const register = async (req, res) => {
        try {
            const { name, email, password, phonenumber } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ message: 'Please provide name, email and password' });
            }

            
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ message: 'Email already registered' });
            }


            const user = await User.create({
                name,
                email,
                password,
                phonenumber
            });

            const token = generateToken(user._id);

            res.status(201).json({
                success: true,
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error("Error in",error)
            res.status(500).json({ message: error.message });
        }
    };

    const login = async (req, res) => {
        try {
            const { email, password } = req.body;

            // Validation
            if (!email || !password) {
                return res.status(400).json({ message: 'Please provide email and password' });
            }

            // Check for user and get password field
            const user = await User.findOne({ email }).select('+password');

            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Check if password matches
            const isMatch = await user.matchPassword(password);

            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Create token
            const token = generateToken(user._id);

            res.status(200).json({
                success: true,
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };


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
        register,
        login,
        createCustomer,
        getCustomer,
        getCustomerById,
        deleteCustomer,
        updateCustomer
    }