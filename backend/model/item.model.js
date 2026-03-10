import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    name: {
      type: String,
    },
    quantity: {
      type: Number,
    },
    rate: {
      type: Number,
    },
    tax: {
      type: Number,
    },
  },
  { timestamps: true },
);

export const Item = mongoose.model("Item", itemSchema);