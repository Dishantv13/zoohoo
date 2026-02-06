import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema(
  {
    name: {
      type: String,
    },
    quantity: {
      type: Number,
    },
    rate: {
      type: Number,
    },
  },
  { timestamps: true },
);

const invoiceSchema = new Schema(
  {
    invoiceNumber: {
      type: String,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    invoiceDate: {
      Date,
    },
    items: [itemSchema],
    subtotal: {
      type: Number,
    },
    tax: {
      type: Number,
      // required : [true,"tax is required"]
    },
    totalAmount: {
      type: Number,
      // required : [true]
    },
  },
  { timestamps: true },
);

export const Invoice = mongoose.model("Invoice", invoiceSchema);
