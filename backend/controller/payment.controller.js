import { 
  processCardPaymentService,
  processQrPaymentService,
  getPaymentStatusService
 } from "../service/payment.services.js";


const processCardPayment = async (req, res) => {
  try {
    const result = await processCardPaymentService(req.user._id, req.body);
    res.status(200).json(result);
  }
  catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const processQRPayment = async (req, res) => {
  try {
    const result = await processQrPaymentService(req.user._id, req.body); 
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

const getPaymentStatus = async (req, res) => {
  try {
    const result = await getPaymentStatusService(req.user._id, { invoiceId: req.params.invoiceId });  
    res.status(200).json(result);
  }catch (error) { 
    res.status(400).json({ message: error.message });
  }
}

export { 
    processCardPayment, 
    processQRPayment, 
    getPaymentStatus
 };
