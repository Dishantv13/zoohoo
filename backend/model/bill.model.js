import mongoose, { Schema } from "mongoose";

const billSchema = new Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
        },
        quantity: {
          type: Number,
        },
        rate: {
          type: Number,
        },
      },
    ],
    totalAmount: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "PARTIALLY_PAID"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);

export const Bill = mongoose.model("Bill", billSchema);
