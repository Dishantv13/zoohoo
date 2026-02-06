import { Router } from "express";
import {
  createCustomer,
  getCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from '../controller/user.controller.js';

const router = Router()

router.route('/').post(createCustomer);
router.route("/").get( getCustomer);
router.route("/:id").get(getCustomerById);
router.route('/:id').put(updateCustomer);
router.route('/:id').delete( deleteCustomer);

export default router;

