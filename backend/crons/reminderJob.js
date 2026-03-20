import cron from "node-cron";
import { Invoice } from "../model/invoice.model.js";
import { Bill } from "../model/bill.model.js";

cron.schedule("* * * * *", async () => {
  console.log("Running invoice reminder cron job...");

  const today = new Date();

  const invoices = await Invoice.countDocuments({
    status: { $ne: "PAID" },
    dueDate: { $lte: today },
  });

  const bills = await Bill.countDocuments({
    status: { $ne: "PAID" },
    dueDate: { $lte: today },
  });

  console.log(`Found ${invoices} overdue invoices.`);
  console.log(`Found ${bills} overdue bills.`);
});
