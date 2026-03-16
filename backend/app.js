import express from "express";
import cors from "cors";

import { apiRateLimiter } from "./middleware/rateLimit.js";
import { globalErrorHandler } from "./middleware/globelErrorHandler.js";

import http from "http";
import { Server } from "socket.io";
import { socketAuth } from "./middleware/auth.js";
import { chatSocket } from "./socket/chat.Socket.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

io.use(socketAuth);
chatSocket(io);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import userRouter from "./routes/user.route.js";
import invoiceRouter from "./routes/invoice.route.js";
import authRouter from "./routes/auth.route.js";
import paymentRouter from "./routes/payment.route.js";
import dashboardRouter from "./routes/report.route.js";
import chatRouter from "./routes/chat.route.js";
import vendorRouter from "./routes/vendor.route.js";
import billRouter from "./routes/bill.route.js";
import itemRouter from "./routes/item.route.js";

app.use("/api/customers", userRouter);
app.use("/api/invoices", invoiceRouter);
app.use("/api/auth", authRouter);
app.use("/api/payments", apiRateLimiter, paymentRouter);
app.use("/api/report", dashboardRouter);
app.use("/api/chat", chatRouter);
app.use("/api/vendors", vendorRouter);
app.use("/api/bills", billRouter);
app.use("/api/items", itemRouter);

app.use(globalErrorHandler);

export { app, server };
