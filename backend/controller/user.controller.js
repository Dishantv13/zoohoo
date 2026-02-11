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
            return res.status(400).json({
                message: "Please provide name, email and password",
            });
        }

        const userExists = await User.findOne({ email: email.toLowerCase() });

        if (userExists) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            phonenumber,
        });
        
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server error",
        });
    }
    };

    const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
        email: email.toLowerCase(),
        }).select("+password");

        if (!user) {
        return res.status(401).json({
            message: "Invalid email or password",
        });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
        return res.status(401).json({
            message: "Invalid email or password",
        });
        }

        const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
        );

        res.json({
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
        message: "Server error",
        });
    }
    };

    const createCustomer = async (req, res) => {
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

            res.status(201).json(user);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    const getCurrentUserProfile = async (req, res) => {
        try {
            const user = await User.findById(req.user._id).select('-password');
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    const getCustomer = async (req, res) => {
        try {
            const customers = await User.find().select('-password');
            res.json(customers);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }


    const updateUserProfile = async (req, res) => {
        try {
            const { name, email, phonenumber } = req.body;

            const user = await User.findByIdAndUpdate(
                req.user._id,
                { name, email, phonenumber },
                { new: true, runValidators: true }
            );

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json(user);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };


    const deleteProfile = async (req, res) => {
        try {
            await User.findByIdAndDelete(req.user.id);
            res.json({ message: 'Account deleted' });
        } catch (err) {
            res.status(500).json({ message: 'Delete failed' });
        }
    };

    const changePassword = async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
    
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ message: "Current password and new password are required" });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ message: "New password must be at least 6 characters" });
            }

            if (currentPassword === newPassword) {
                return res.status(400).json({ message: "New password cannot be the same as current password" });
            }

            const user = await User.findById(req.user._id).select("+password");
    
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
  
            const isPasswordMatch = await user.matchPassword(currentPassword);

    
            if (!isPasswordMatch) {
                return res.status(401).json({ message: "Current password is incorrect" });
            }
 
            user.password = newPassword;
            await user.save();

    
            res.status(200).json({ message: "Password updated successfully" });
    
        } catch (error) {
            console.error("Change password error:", error);
            res.status(500).json({ message: "Error updating password" });
        }
    }


    export {
        register,
        login,
        createCustomer,
        getCustomer,
        getCurrentUserProfile,
        updateUserProfile,
        deleteProfile,
        changePassword
    }