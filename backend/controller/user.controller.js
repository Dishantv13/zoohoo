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

export {
    createCustomer,
    getCustomer
}