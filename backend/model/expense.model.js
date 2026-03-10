import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    catagory: {
      type: String,
    },
    amount: {
      type: Number,
    },
    description: {
      type: String,
    },
    expenseDate: {
      type: Date,
    },
  },
  { timestamps: true },
);

export const Expense = mongoose.model("Expense", expenseSchema);
