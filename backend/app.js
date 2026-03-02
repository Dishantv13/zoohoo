import express from "express";
import cors from "cors";

import { apiRateLimiter } from "./middleware/rateLimit.js";
import { globalErrorHandler } from "./middleware/globelErrorHandler.js";

const app = new express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import userRouter from "./routes/user.route.js";
import invoiceRouter from "./routes/invoice.route.js";
import authRouter from "./routes/auth.route.js";
import paymentRouter from "./routes/payment.route.js";
import dashboardRouter from "./routes/report.route.js";

app.use("/api/customers", userRouter);
app.use("/api/invoices", invoiceRouter);
app.use("/api/auth", authRouter);
app.use("/api/payments", apiRateLimiter, paymentRouter);
app.use("/api/dashboard", dashboardRouter);
    
app.use(globalErrorHandler);

export default app;
