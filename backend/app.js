import express from "express";
import cors from "cors";

const app = new express();

app.use(cors());
app.use(express.json());

import userRouter from "./routes/user.route.js";
import invoiceRouter from "./routes/invoice.route.js";
import authRouter from "./routes/auth.route.js";
import paymentRouter from "./routes/payment.route.js";

app.use("/api/customers", userRouter);
app.use("/api/invoices", invoiceRouter);
app.use("/api/auth", authRouter);
app.use("/api/payments", paymentRouter);

export default app;
